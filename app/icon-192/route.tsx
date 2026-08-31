import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#047857",
          borderRadius: 40,
          color: "white",
          fontSize: 88,
          fontWeight: 800,
        }}
      >
        S
      </div>
    ),
    { width: 192, height: 192 },
  );
}
