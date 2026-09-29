import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_URL, formatLongDate, formatTime, isSlug } from "@/lib/format";
import { getPublicWedding, sortEvents, type PublicWedding } from "@/lib/weddings";
import { themeById } from "@/lib/themes";

// The invitation card (D-012), drawn from what guests already see on the website.
// "wide" is the preview WhatsApp shows when the website link is shared.
// "tall" is for family groups and WhatsApp status.

const serif = await readFile(join(process.cwd(), "assets/fonts/CormorantGaramond-SemiBold.ttf"));

const SIZES = {
  wide: { width: 1200, height: 630 },
  tall: { width: 1080, height: 1350 },
} as const;

const INK = "#1f1b18";
const MUTED = "#6f655c";

type Palette = ReturnType<typeof themeById>["palette"];

// Shrinks long names so they stay on one line. Allows about 0.52 em a letter, which
// leaves room for capitals.
function fit(text: string, width: number, max: number, min: number) {
  return Math.round(Math.max(min, Math.min(max, width / (Math.max(text.length, 1) * 0.52))));
}

// The image renderer cannot place accents that sit on a letter as a separate mark, such as
// the tone mark on a Yoruba ọ̀, and draws them beside the letter. Accents with a letter of
// their own (é, á, ẹ, ọ) are kept; the leftover marks are dropped, on the card only.
function clean(text: string) {
  return text.normalize("NFC").replace(/[\u0300-\u036f]/g, "");
}

function forCard(w: PublicWedding): PublicWedding {
  return {
    ...w,
    partner_one: clean(w.partner_one),
    partner_two: clean(w.partner_two),
    events: (w.events ?? []).map((e) => ({ ...e, title: clean(e.title), venue: clean(e.venue) })),
  };
}

// The aso-oke stripe from the website, as blocks, since the image renderer draws boxes best.
function Band({ p, width }: { p: Palette; width: number }) {
  return (
    <div style={{ display: "flex", width: "100%", height: 14, overflow: "hidden" }}>
      {Array.from({ length: Math.ceil(width / 26) }, (_, i) => (
        <div key={i} style={{ display: "flex", flexShrink: 0 }}>
          <div style={{ width: 14, height: 14, backgroundColor: p.primary }} />
          <div style={{ width: 4, height: 14, backgroundColor: p.gold }} />
          <div style={{ width: 4, height: 14, backgroundColor: p.goldSoft }} />
          <div style={{ width: 4, height: 14, backgroundColor: p.gold }} />
        </div>
      ))}
    </div>
  );
}

function Ornament({ p, margin }: { p: Palette; margin: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: margin, marginBottom: margin }}>
      <div style={{ width: 90, height: 2, backgroundColor: p.gold }} />
      <div style={{ width: 16, height: 16, marginLeft: 18, marginRight: 18, backgroundColor: p.gold, transform: "rotate(45deg)" }} />
      <div style={{ width: 90, height: 2, backgroundColor: p.gold }} />
    </div>
  );
}

function Wide({ w, p }: { w: PublicWedding; p: Palette }) {
  const names = `${w.partner_one} & ${w.partner_two}`;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 70px", textAlign: "center" }}>
      <div style={{ fontSize: 28, letterSpacing: 5, textTransform: "uppercase", color: p.gold }}>You are invited to the wedding of</div>
      <div style={{ marginTop: 14, fontSize: fit(names, 1060, 112, 60), lineHeight: 1.05, color: p.primary }}>{names}</div>
      <Ornament p={p} margin={26} />
      {w.wedding_date ? <div style={{ fontSize: 44, color: INK }}>{formatLongDate(w.wedding_date)}</div> : null}
      {w.hashtag ? <div style={{ marginTop: 10, fontSize: 36, color: p.primary }}>{`#${w.hashtag}`}</div> : null}
    </div>
  );
}

function Tall({ w, p }: { w: PublicWedding; p: Palette }) {
  const longest = w.partner_one.length > w.partner_two.length ? w.partner_one : w.partner_two;
  const nameSize = fit(longest, 940, 150, 64);
  const events = sortEvents(w.events ?? []).slice(0, 3);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 70px", textAlign: "center" }}>
      <div style={{ fontSize: 32, letterSpacing: 6, textTransform: "uppercase", color: p.gold }}>Together with their families</div>
      <div style={{ marginTop: 26, fontSize: nameSize, lineHeight: 1.02, color: p.primary }}>{w.partner_one}</div>
      <div style={{ fontSize: Math.round(nameSize * 0.55), lineHeight: 1.1, color: p.gold }}>{"&"}</div>
      <div style={{ fontSize: nameSize, lineHeight: 1.02, color: p.primary }}>{w.partner_two}</div>
      <div style={{ marginTop: 26, fontSize: 40, color: INK }}>invite you to celebrate their wedding</div>
      <Ornament p={p} margin={30} />
      {w.wedding_date ? <div style={{ fontSize: 50, color: INK }}>{formatLongDate(w.wedding_date)}</div> : null}
      {events.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 22 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 14 }}>
              <div style={{ fontSize: 38, color: p.primary }}>{e.title}</div>
              <div style={{ fontSize: 30, color: MUTED }}>
                {[e.date ? formatLongDate(e.date) : "", e.time ? formatTime(e.time) : "", e.venue].filter(Boolean).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {w.hashtag ? <div style={{ marginTop: 26, fontSize: 40, color: p.primary }}>{`#${w.hashtag}`}</div> : null}
    </div>
  );
}

export async function GET(request: Request, ctx: RouteContext<"/w/[slug]/card">) {
  const { slug } = await ctx.params;
  if (!isSlug(slug)) return new Response("Not found", { status: 404 });
  const wedding = await getPublicWedding(slug);
  if (!wedding) return new Response("Not found", { status: 404 });

  const card = forCard(wedding);
  const format = new URL(request.url).searchParams.get("format") === "tall" ? "tall" : "wide";
  const size = SIZES[format];
  const p = themeById(wedding.theme).palette;
  const address = `${SITE_URL.replace(/^https?:\/\//, "")}/w/${wedding.slug}`;

  try {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: p.paper, fontFamily: "Cormorant" }}>
          <Band p={p} width={size.width} />
          {format === "tall" ? <Tall w={card} p={p} /> : <Wide w={card} p={p} />}
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 26, fontSize: format === "tall" ? 32 : 26, color: MUTED }}>
            {`RSVP at ${address}`}
          </div>
          <Band p={p} width={size.width} />
        </div>
      ),
      {
        ...size,
        fonts: [{ name: "Cormorant", data: serif, weight: 600, style: "normal" }],
        headers: {
          // The library's default is to cache for a year. Couples change their details, so don't.
          "cache-control": "public, max-age=0, must-revalidate",
          "content-disposition": `inline; filename="invitation-${wedding.slug}${format === "tall" ? "-tall" : ""}.png"`,
        },
      },
    );
  } catch (err) {
    console.error("invitation card failed", err);
    return new Response("Could not draw the card", { status: 500 });
  }
}
