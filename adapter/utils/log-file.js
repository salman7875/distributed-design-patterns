const fs = require("fs/promises");

const logFileExists = async (filePath) => {
  const fileExists = await fs
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  if (!fileExists) {
    await fs.writeFile(filePath, "");
  }
};

module.exports = { logFileExists };
