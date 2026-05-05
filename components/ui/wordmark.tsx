// REP wordmark — SVG path from the brand system.
export const REP_LOGO_PATH =
  "M 0 25.024 L 0 0 L 19.562 0 C 26.326 0 32.361 2.553 32.361 9.3 C 32.361 12.552 30.849 15.004 28.207 16.473 C 27.565 16.828 26.141 17.395 26.141 17.395 L 33.448 25.024 L 0 25.024 Z M 103.074 9.229 C 103.074 15.49 97.767 18.438 89.71 18.438 L 89.71 24.912 L 70.778 24.912 L 70.778 0.02 L 89.71 0.02 C 97.756 0.02 103.074 2.968 103.074 9.229 Z M 62.593 18.1 C 62.593 14.924 62.593 15.3 62.593 12.67 L 58.606 12.701 C 58.606 12.701 58.606 7.574 58.606 7.021 L 66.776 7.021 L 66.776 0.122 L 36.982 0.122 L 36.982 25.013 L 66.722 25.013 L 66.722 18.114 L 62.593 18.1 Z"

export function Wordmark({
  size = 24,
  color = "#fff",
}: {
  size?: number
  color?: string
}) {
  const w = size * (103.074 / 25.024)
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 103.074 25.024"
      fill={color}
      style={{ display: "block" }}
    >
      <path d={REP_LOGO_PATH} />
    </svg>
  )
}
