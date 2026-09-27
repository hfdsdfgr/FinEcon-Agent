import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import path from "node:path";
import { formatNumber } from "../src/components/Results";

async function upload(page: Page, csv?: string) {
  await page
    .locator("#dataset-file")
    .setInputFiles(
      csv
        ? { name: "input.csv", mimeType: "text/csv", buffer: Buffer.from(csv) }
        : path.resolve("public/sample.csv"),
    );
  await expect(
    page.getByRole("table", { name: "Dataset preview", exact: true }),
  ).toBeVisible();
}

test("real Agent research, truthful workflow, report and persisted task restore", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "API connected" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("workspace-empty.png"),
    fullPage: true,
  });
  await page
    .getByLabel("Research question", { exact: true })
    .fill("研究汇率变化与指数收益的线性关联");
  await upload(page);
  await page.screenshot({
    path: testInfo.outputPath("workspace-data.png"),
    fullPage: true,
  });
  const response = page.waitForResponse(
    (response) =>
      response.url().endsWith("/agent/research") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "启动分析" }).click();
  const task = await (await response).json();
  expect(task.status).toBe("completed");
  await expect(
    page.getByRole("table", { name: "OLS coefficients" }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: "OLS coefficients" }),
  ).toContainText(formatNumber(task.results.ols.coefficients.USDCNY_return));
  await expect(
    page
      .locator(".step")
      .filter({
        has: page.getByRole("heading", {
          name: "Stationarity Test",
          exact: true,
        }),
      }),
  ).toContainText("warning");
  await page.screenshot({
    path: testInfo.outputPath("analysis.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Research Report", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Interpretation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("研究汇率变化与指数收益的线性关联", { exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON" }).click();
  expect((await download).suggestedFilename()).toContain(task.task_id);
  await page.reload();
  await page.getByLabel("Task ID", { exact: true }).fill(task.task_id);
  await page.getByRole("button", { name: "读取任务与报告" }).click();
  await expect(
    page.getByRole("heading", { name: "Interpretation", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("report.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("direct descriptive and OLS endpoints, changing inputs clears results", async ({
  page,
}) => {
  await page.goto("/");
  await upload(page);
  await page.getByLabel("Analysis method").selectOption("descriptive");
  const response = page.waitForResponse((response) =>
    response.url().endsWith("/analysis/descriptive"),
  );
  await page.getByRole("button", { name: "启动分析" }).click();
  const result = await (await response).json();
  await expect(
    page.getByRole("table", { name: "Descriptive statistics", exact: true }),
  ).toContainText(formatNumber(result.statistics.CSI300_return.mean));
  await expect(
    page.getByRole("table", { name: "Correlation matrix", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Research Workspace", exact: true })
    .click();
  await page.getByLabel("Analysis method").selectOption("ols");
  const olsResponse = page.waitForResponse((response) =>
    response.url().endsWith("/analysis/ols"),
  );
  await page.getByRole("button", { name: "启动分析" }).click();
  expect((await olsResponse).status()).toBe(200);
  await expect(
    page.getByRole("table", { name: "OLS coefficients" }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Descriptive statistics", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Research Workspace", exact: true })
    .click();
  await page
    .getByLabel("Research question", { exact: true })
    .fill("New specification");
  await page.getByRole("link", { name: "Analysis", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "OLS coefficients" }),
  ).toHaveCount(0);
});

test("Excel, missing values, failed OLS, missing task and unavailable diagnostics", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#dataset-file")
    .setInputFiles({
      name: "data.xlsx",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("reserved"),
    });
  await expect(page.getByRole("alert")).toContainText("Not implemented yet");
  await upload(page, "y,x\n1,2\n2,\n3,4");
  await page.getByLabel("Analysis method").selectOption("ols");
  await page.getByRole("button", { name: "启动分析" }).click();
  await expect(page.getByRole("alert")).toContainText("缺失值");
  await page
    .getByRole("link", { name: "Research Workspace", exact: true })
    .click();
  await upload(page, "y,x\n1,2\n2,2\n3,2\n4,2");
  await page.getByRole("button", { name: "启动分析" }).click();
  await expect(page.getByRole("alert")).toContainText("rank deficient");
  await expect(
    page
      .locator(".step")
      .filter({
        has: page.getByRole("heading", {
          name: "Model Estimation",
          exact: true,
        }),
      }),
  ).toContainText("failed");
  await page
    .getByRole("link", { name: "Research Report", exact: true })
    .click();
  await page.getByLabel("Task ID", { exact: true }).fill("missing-task");
  await page.getByRole("button", { name: "读取任务与报告" }).click();
  await expect(page.getByRole("alert")).toContainText("Task not found");
  await page.getByRole("link", { name: "Diagnostics", exact: true }).click();
  await expect(page.locator("main .reserved")).toHaveCount(7);
});

test("mobile navigation, contained tables and offline feedback", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await upload(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("mobile.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "Diagnostics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Diagnostics", exact: true, level: 1 }),
  ).toBeVisible();
  await page.route("**/api/health", (route) => route.abort());
  await page.getByRole("button", { name: "API connected" }).click();
  await expect(
    page.getByRole("button", { name: "API offline · Retry" }),
  ).toBeVisible();
});
