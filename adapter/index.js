const fs = require("fs");
const fsPromise = require("fs/promises");
const path = require("path");
const { FORMATTER } = require("./utils/formatter");
const { logFileExists } = require("./utils/log-file");

const UNIFIED_FILE = "unified-log.txt";
const SVC1_FILE = "service1-log.txt";
const SVC2_FILE = "service2-log.txt";
const SVC3_FILE = "service3-log.txt";

const LOG_DIR = path.join(__dirname, "../logs");
const UNIFIED_PATH = path.join(LOG_DIR, UNIFIED_FILE);

logFileExists(UNIFIED_PATH)
  .then(() => console.log("success!"))
  .catch((err) => console.log(err));

const processFile = async () => {
  try {
    const watcher = fsPromise.watch(LOG_DIR, {
      recursive: true,
    });

    for await (const event of watcher) {
      const { eventType, filename } = event;

      if (eventType === "rename" || !filename || filename === UNIFIED_FILE) {
        continue;
      }

      let formattedLogs = [];
      const filePath = path.join(LOG_DIR, filename);

      try {
        if (filename === SVC1_FILE) {
          const rawLines = await fsPromise.readFile(filePath, "utf-8");
          const newRawLine = rawLines.split("\n").filter(Boolean).at(-1);
          if (newRawLine) {
            formattedLogs = FORMATTER.textFormatter(newRawLine);
          }
        } else if (filename === SVC2_FILE) {
          const rawLines = await fsPromise.readFile(filePath, "utf-8");
          const newRawLines = rawLines.split("\n").filter(Boolean);
          const bottomRawLines = newRawLines.slice(-5).join("\n");
          if (bottomRawLines) {
            formattedLogs = FORMATTER.promFormatter(
              bottomRawLines,
              "prom-log-service",
            );
          }
        } else if (filename === SVC3_FILE) {
          const rawLines = await fsPromise.readFile(filePath, "utf-8");
          const newRawLine = rawLines.split("\n").filter(Boolean).at(-1);
          if (newRawLine) {
            formattedLogs = FORMATTER.jsonFormatter(newRawLine);
          }
        }

        if (formattedLogs && formattedLogs.length > 0) {
          const entries = Array.isArray(formattedLogs)
            ? formattedLogs
            : [formattedLogs];

          for (const entry of entries) {
            await fsPromise.appendFile(
              UNIFIED_PATH,
              JSON.stringify(entry) + "\n",
            );
          }
          console.log(`Processed and appended records from ${filename}`);
        }
      } catch (readErr) {
        if (readErr.code !== "ENOENT") {
          console.error(`Error reading ${filename}:`, readErr.message);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

processFile();
