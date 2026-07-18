import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_ICON = path.join(
  __dirname,
  "public",
  "assets",
  "icons",
  "icon.png",
); // Path to your source image
const OUTPUT_DIR = path.join(__dirname, "public", "assets", "icons");
const SIZES = [48, 72, 96, 128, 144, 192, 256, 384, 512];

const MANIFEST_PATH = path.join(__dirname, "public", "manifest.json"); // Path to your manifest file

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  try {
    console.log("Architecting icon assets...");

    for (const size of SIZES) {
      // 1. Generate Standard PWA Icon ('any')
      const standardPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      await sharp(SOURCE_ICON).resize(size, size).toFile(standardPath);

      // 2. Generate Maskable Icon ('maskable')
      // Shrinks the core asset down to 70% and places it on a transparent or solid canvas
      // to ensure Android shapes don't clip the rounded edges of your "B" container.
      const maskablePath = path.join(
        OUTPUT_DIR,
        `icon-${size}x${size}-maskable.png`,
      );
      const innerSize = Math.round(size * 0.7);

      await sharp(SOURCE_ICON)
        .resize(innerSize, innerSize)
        .extend({
          top: Math.floor((size - innerSize) / 2),
          bottom: Math.ceil((size - innerSize) / 2),
          left: Math.floor((size - innerSize) / 2),
          right: Math.ceil((size - innerSize) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Keeps it clean or match with brand-primary hex
        })
        .toFile(maskablePath);

      console.log(`✓ Generated ${size}xsize variations.`);
    }

    console.log("\nAll assets compiled successfully in assets/icons/");
  } catch (error) {
    console.error("Generation failed:", error);
  }
}

function updateManifestIcons() {
  try {
    // 1. Generate the icon objects array matching your build assets
    const iconsArray = SIZES.flatMap((size) => [
      {
        src: `/assets/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/assets/icons/icon-${size}x${size}-maskable.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "maskable",
      },
    ]);

    let manifestData = {};

    // 2. Read existing manifest if it exists, otherwise initialize an empty object
    if (fs.existsSync(MANIFEST_PATH)) {
      const fileContent = fs.readFileSync(MANIFEST_PATH, "utf-8");
      manifestData = JSON.parse(fileContent || "{}");
      console.log("Found existing manifest.json. Injecting icons...");
    } else {
      console.log("No manifest.json found. Creating a new one...");
      // Default boilerplate fallback if you don't have one yet
      manifestData = {
        name: "Budgeteer",
        "short-name": "Budgeteer",
        icons: [],
        "start-url": "/",
        display: "standalone",
        "theme-color": "#f8fafc",
        background_color: "#020617",
      };
    }

    // 3. Assign or overwrite the icons property
    manifestData.icons = iconsArray;

    // 4. Write the file back out with clean formatting
    fs.writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(manifestData, null, 4),
      "utf-8",
    );
    console.log(
      "✓ manifest.json successfully updated with matching icon objects.",
    );
  } catch (error) {
    console.error("Failed to update manifest.json:", error);
  }
}

// generateIcons();
// updateManifestIcons();
