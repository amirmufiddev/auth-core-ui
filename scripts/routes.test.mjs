import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

function readUtf8(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function listFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function extractSection(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  assert.ok(startIdx !== -1, `Marker "${startMarker}" tidak ditemukan`);
  const endIdx = endMarker
    ? source.indexOf(endMarker, startIdx)
    : source.length;
  assert.ok(endIdx !== -1, `Marker akhir "${endMarker}" tidak ditemukan`);
  return source.slice(startIdx, endIdx);
}

function collectHrefsWithShared(slice, appHrefs) {
  const direct = Array.from(slice.matchAll(/href:\s*"([^"]+)"/g)).map(
    (m) => m[1],
  );
  if (
    slice.includes("child: applicationItems") ||
    slice.includes("...applicationItems")
  ) {
    return [...direct, ...appHrefs];
  }
  return direct;
}

test("menusConfig.mainNav, sidebarNav.modern, dan sidebarNav.classic sinkron", () => {
  const menusSource = readUtf8("src/config/menus.ts");
  const appSlice = extractSection(
    menusSource,
    "const applicationItems",
    "export const menusConfig",
  );
  const appHrefs = Array.from(appSlice.matchAll(/href:\s*"([^"]+)"/g)).map(
    (m) => m[1],
  );

  const runtimeConfigSlice = extractSection(
    menusSource,
    "} = {",
    "export function collectMenuHrefs",
  );

  const mainNavHrefs = collectHrefsWithShared(
    extractSection(runtimeConfigSlice, "mainNav:", "sidebarNav:"),
    appHrefs,
  );
  const modernHrefs = collectHrefsWithShared(
    extractSection(runtimeConfigSlice, "modern:", "classic:"),
    appHrefs,
  );
  const classicHrefs = collectHrefsWithShared(
    extractSection(runtimeConfigSlice, "classic:", null),
    appHrefs,
  );

  assert.ok(
    mainNavHrefs.length >= 9,
    "Minimal 9 route harus terdaftar di menu",
  );
  assert.deepEqual(modernHrefs, mainNavHrefs);
  assert.deepEqual(classicHrefs, mainNavHrefs);

  for (const required of [
    "/dashboard",
    "/users",
    "/roles",
    "/organizations",
    "/sessions",
    "/api-keys",
    "/audit-logs",
    "/auth-features",
    "/account",
  ]) {
    assert.ok(
      mainNavHrefs.includes(required),
      `Menu harus mendaftarkan ${required}`,
    );
  }
});

test("setiap href di menus.ts memiliki file route di src/routes/_authenticated/", () => {
  const menusSource = readUtf8("src/config/menus.ts");
  const allHrefs = Array.from(menusSource.matchAll(/href:\s*"([^"]+)"/g)).map(
    (m) => m[1],
  );
  const uniqueHrefs = Array.from(new Set(allHrefs));

  assert.ok(uniqueHrefs.length >= 9);
  for (const href of uniqueHrefs) {
    const slug = href.replace(/^\//, "");
    const routeFile = path.join(
      ROOT,
      "src/routes/_authenticated",
      `${slug}.tsx`,
    );
    assert.ok(
      fs.existsSync(routeFile),
      `File route tidak ditemukan untuk menu ${href}: ${routeFile}`,
    );
  }
});

test("tidak ada import atau direktif Next.js terlarang di src/", () => {
  const files = listFilesRecursive(path.join(ROOT, "src")).filter((f) =>
    /\.(ts|tsx)$/.test(f),
  );
  const forbiddenPatterns = [
    /from\s+["']next\//,
    /from\s+["']next-safe-action/,
    /from\s+["']next-themes/,
    /["']use client["']/,
    /["']use server["']/,
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Pola Next.js terlarang (${pattern}) ditemukan di ${path.relative(ROOT, file)}`,
      );
    }
  }
});

test("katalog fitur Better Auth tidak memiliki duplikasi ID dan semua dependency valid", () => {
  const configSource = readUtf8("src/config/better-auth.config.ts");
  const idMatches = Array.from(
    configSource.matchAll(/^\s{4}id:\s*"([^"]+)"/gm),
  ).map((m) => m[1]);

  const uniqueIds = new Set(idMatches);
  assert.equal(
    uniqueIds.size,
    idMatches.length,
    "Terdapat ID fitur duplikat di better-auth.config.ts",
  );
  assert.ok(uniqueIds.size >= 40, "Katalog fitur Better Auth harus lengkap");

  const depBlocks = Array.from(
    configSource.matchAll(/dependencies:\s*\[([^\]]+)\]/g),
  );
  for (const block of depBlocks) {
    const deps = Array.from(block[1].matchAll(/"([^"]+)"/g)).map((m) => m[1]);
    for (const dep of deps) {
      assert.ok(
        uniqueIds.has(dep),
        `Dependency "${dep}" tidak ditemukan di BETTER_AUTH_FEATURES`,
      );
    }
  }
});

test("komponen better-auth mandiri tidak memakai package better-auth-ui eksternal", () => {
  const pkgJson = JSON.parse(readUtf8("package.json"));
  const allDeps = {
    ...(pkgJson.dependencies ?? {}),
    ...(pkgJson.devDependencies ?? {}),
  };

  assert.equal(
    "@daveyplate/better-auth-ui" in allDeps,
    false,
    "Package @daveyplate/better-auth-ui tidak boleh terpasang",
  );
  assert.equal(
    "better-auth-ui" in allDeps,
    false,
    "Package better-auth-ui tidak boleh terpasang",
  );

  const files = listFilesRecursive(path.join(ROOT, "src")).filter((f) =>
    /\.(ts|tsx)$/.test(f),
  );
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    assert.equal(
      /from\s+["'](@daveyplate\/)?better-auth-ui/.test(content),
      false,
      `Import better-auth-ui eksternal ditemukan di ${path.relative(ROOT, file)}`,
    );
  }

  const barrelSource = readUtf8("src/components/better-auth/index.ts");
  for (const expectedExport of [
    "AuthUIProvider",
    "AuthView",
    "AccountView",
    "OrganizationView",
    "UserButton",
    "OrganizationSwitcher",
    "SignedIn",
    "SignedOut",
  ]) {
    assert.ok(
      barrelSource.includes(expectedExport),
      `Barrel src/components/better-auth/index.ts harus mengekspor ${expectedExport}`,
    );
  }
});
