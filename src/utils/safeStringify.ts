export function safeStringify(obj: any, space = 2): string {
  return JSON.stringify(obj, (_key, value) =>
    typeof value === "bigint"
      ? value.toString()
      : value && value._isBigNumber // ethers v5 BigNumber
      ? value.toString()
      : value && typeof value.toHexString === "function" // ethers v6 BigNumber
      ? value.toString()
      : value,
    space
  );
} 