const urlExtracter = (rawUrl = "") => {
  const queryPart = rawUrl.includes("?") ? rawUrl.split("?")[1] : rawUrl;
  const params = new URLSearchParams(queryPart);
  const hash = {};

  for (const [key, value] of params.entries()) {
    hash[key.trim().toLowerCase()] = value;
  }

  return hash;
};

const filterData = (data, queryMap = {}) => {
  const q = (queryMap.q || "").trim().toLowerCase();
  const cat = (queryMap.cat ?? queryMap.category ?? "").trim().toLowerCase();
  const platform = (queryMap.platform || "").trim().toLowerCase();

  return data.filter((item) => {
    const itemName = (item.name || "").toLowerCase();
    const itemCat = (item.category ?? item.cat ?? "").toLowerCase();
    const itemPlatform = (item.platform || "").toLowerCase();

    const matchesName = !q || itemName.includes(q);
    const matchesCategory = !cat || cat === "all" || itemCat === cat;
    const matchesPlatform =
      !platform || platform === "all" || itemPlatform === platform;

    return matchesName && matchesCategory && matchesPlatform;
  });
};

const resolveQuorom = (promises, quorom) => {
  const total = promises.length;
  const maxAllowedErrors = total - quorom;

  if (quorom <= 0) {
    return Promise.resolve([]);
  }

  if (quorom > total) {
    return Promise.reject(
      new Error(
        `Cannot reach quorom of ${quorom} from total ${total} promise!`,
      ),
    );
  }

  return new Promise((resolve, reject) => {
    const success = [];
    const errors = [];
    let settled = false;

    for (const p of promises) {
      Promise.resolve(p).then(
        (val) => {
          if (settled) return;
          success.push(val);

          if (success.length >= quorom) {
            settled = true;
            resolve(success.slice(0, quorom));
          }
        },
        (err) => {
          if (settled) return;
          errors.push(err);

          if (errors.length > maxAllowedErrors) {
            settled = true;
            reject(new Error(errors));
          }
        },
      );
    }
  });
};

const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    const resData = await res.json();

    if (!res.ok || !resData.success) {
      throw new Error(resData?.message ?? "Something went wrong!");
    }
    return resData.data;
  } catch (error) {
    throw new Error(error);
  }
};

const formatResult = (result) => {
  const productsByKey = new Map();

  for (const batch of result) {
    if (!Array.isArray(batch)) continue;

    for (const item of batch) {
      if (!item || !item.name) continue;

      const { id, name, category, brand, rating, platform, ...others } = item;
      const key = `${(brand || "").trim().toLowerCase()}::${name.trim().toLowerCase()}`;

      if (!productsByKey.has(key)) {
        productsByKey.set(key, {
          id,
          name,
          category,
          brand,
          rating,
          platforms: {},
        });
      }

      const entry = productsByKey.get(key);
      entry.category = entry.category ?? category;
      entry.brand = entry.brand ?? brand;
      entry.rating = entry.rating ?? rating;

      if (platform) {
        entry.platforms[platform] = {
          ...(id !== undefined ? { id } : {}),
          ...(rating !== undefined ? { rating } : {}),
          ...others,
        };
      }
    }
  }

  return Array.from(productsByKey.values());
};

const httpResponse = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

module.exports = {
  httpResponse,
  urlExtracter,
  filterData,
  resolveQuorom,
  fetchData,
  formatResult,
};
