import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Every test file gets its own data folder, rebuilt from the seed on first read.
process.env.HADAMLEY_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hadamley-test-"));
// Never call the real model from tests.
delete process.env.ANTHROPIC_API_KEY;
process.env.HADAMLEY_STORE = "file";
