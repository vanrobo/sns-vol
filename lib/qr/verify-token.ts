import crypto from "crypto";

export type QrPayload = {
  volunteer_id: string;
  name: string;
  status: string;
  valid_until: string | null;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.QR_SIGNING_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("QR_SIGNING_SECRET is not configured");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createVerifyToken(payload: Omit<QrPayload, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const data: QrPayload = { ...payload, exp };
  const json = JSON.stringify(data);
  const encoded = Buffer.from(json).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function parseVerifyToken(token: string): QrPayload | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as QrPayload;

    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function getVerifyUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/verify/${token}`;
}
