const textFormatter = (rawLine) => {
  const tokens = rawLine.trim().split(" ");
  let serviceName = "";
  let status = "";
  let timestamp = "";
  let result = [];

  for (const token of tokens) {
    if (token.startsWith("[")) {
      timestamp = token.replace(/[\[\]]/g, "");
    } else if (token.includes("=")) {
      const [key, value] = token.split("=");

      if (key === "SERVICE") {
        serviceName = value;
      } else if (key === "STATUS") {
        status = value;
      } else {
        result.push({
          service: serviceName,
          timestamp,
          status,
          metric: key.toLowerCase(),
          value: !isNaN(value) ? Number(value) : value,
        });
      }
    }
  }
  return result;
};

const promFormatter = (
  rawLinesString,
  serviceName = "unknown-prom-service",
) => {
  const lines = rawLinesString.split("\n");
  const result = [];
  const timestamp = new Date().toISOString();

  const metricRegex = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]+)\})?\s+([0-9.]+)/;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(metricRegex);
    if (match) {
      const [, metricName, rawTags, rawValue] = match;
      const tags = {};

      if (rawTags) {
        const tagRegex = /([a-zA-Z0-9_]+)="([^"]+)"/g;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(rawTags)) !== null) {
          tags[tagMatch[1]] = tagMatch[2];
        }
      }

      result.push({
        service: serviceName,
        metric: metricName.toLowerCase(),
        value: Number(rawValue),
        timestamp: timestamp,
        tags: tags,
      });
    }
  }

  return result;
};

const jsonFormatter = (rawJsonString) => {
  try {
    const data = JSON.parse(rawJsonString);
    const result = [];

    const serviceName = data.service_name || "unknown-service";
    const timestamp = data.timestamp || Date.now();
    const status = data.status || "unknown";
    const tags = data.tags || {};
    const metrics = data.metrics || {};

    for (const [metricKey, metricValue] of Object.entries(metrics)) {
      result.push({
        service: serviceName,
        metric: metricKey.toLowerCase(),
        value: metricValue,
        timestamp: timestamp,
        status: status,
        tags: tags,
      });
    }

    return result;
  } catch (err) {
    console.error("Failed to parse JSON log line:", err);
    return [];
  }
};

export const FORMATTER = {
  textFormatter,
  promFormatter,
  jsonFormatter,
};
