const crypto = require("crypto");

class ConsistentHash {
  constructor(replicas = 3) {
    this.replicas = replicas;
    this.ring = [];
    this.nodeMap = {};
  }

  _hash(key) {
    const hashHex = crypto.createHash("md5").update(key).digest("hex");
    return parseInt(hashHex.substring(0, 8), 16);
  }

  _search(arr, val) {
    let low = 0;
    let high = arr.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (arr[mid] < val) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  }

  addNode(node) {
    for (let i = 0; i < this.replicas; i++) {
      const virtualKey = `${node}-${i}`;
      const hashValue = this._hash(virtualKey);
      const idx = this._search(this.ring, hashValue);
      this.ring.splice(idx, 0, hashValue);
      this.nodeMap[hashValue] = node;
    }
  }

  removeNode(node) {
    const hashesToRemove = [];

    for (const [hashValue, mappedNode] of Object.entries(this.nodeMap)) {
      if (mappedNode === node) {
        const numHash = Number(hashValue);
        hashesToRemove.push(numHash);
        delete this.nodeMap[hashValue];
      }
    }

    this.ring = this.ring.filter((hash) => !hashesToRemove.includes(hash));
  }

  getNode(key) {
    if (this.ring.length === 0) return null;

    const hashValue = this._hash(key);
    let idx = this._search(this.ring, hashValue);

    if (idx === this.ring.length) {
      idx = 0;
    }

    return this.nodeMap[this.ring[idx]];
  }
}

const nodeLists = [
  { host: "sharded-service-cache-server-1-1", port: 11211 },
  { host: "sharded-service-cache-server-2-1", port: 11212 },
  { host: "sharded-service-cache-server-3-1", port: 11213 },
];

const ch = new ConsistentHash(3);
const nodeLookUp = {};

nodeLists.forEach((node) => {
  const identifier = `${node.host}:${node.port}`;
  nodeLookUp[identifier] = node;
  ch.addNode(identifier);
});

const cacheKey = "07907907";

const targetIdentifier = ch.getNode(cacheKey);
const targetNode = nodeLookUp[targetIdentifier];

console.log(
  `Routing key ${cacheKey} to node -> ${targetNode.host}:${targetNode.port}`,
);

module.exports = { ConsistentHash };
