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
          borderRadius: 96,
          color: "white",
          fontSize: 220,
          fontWeight: 800,
        }}
      >
        S
      </div>
    ),
    { width: 512, height: 512 },
  );
}
