const text = "; model printing time: 9h 53m 41s; total estimated time: 10h 3m 50s";
const tMatch1 = text.match(/(?:estimated|model|total) (?:printing )?time.*?[=:]\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i);
console.log(tMatch1);

const configText = '<metadata key="prediction" value="36230" />';
const tMatch2 = configText.match(/key="(?:[a-zA-Z0-9_]*?time|prediction)"\s+value="([\d.]+)"/i);
console.log(tMatch2);
