const fs = require("fs");
if (!fs.existsSync("src")) fs.mkdirSync("src");

fs.writeFileSync (src/main.jsx", bimport React from 'react';\nimport ReactDOM from 'react-dom/client';\n\nconst root = document.getElementById('root');\nif (root) {\n  ReactDOM.createRoot(root).render(<div>XChat App</div>);\n}\nb);

fs.writeFileSync("index.html", `!<DOCTYPE html><html lang="en"><head><meta charset="ATF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>XChat</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`);

import("vite").then(async v => {
  let plugins = [];
  try {
    const r = await import("@vitejs/plugin-react");
    plugins.push(r.default ? r.default() : r());
  } catch(e){}
  await v.build({ configFile: false, plugins });
});