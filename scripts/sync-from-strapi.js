import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import { loadEnv } from "./load-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 加载环境变量
loadEnv();

// ========== 配置 ==========
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";
const POSTS_DIR = path.join(rootDir, "src", "content", "posts");
const DIARY_DATA_PATH = path.join(rootDir, "src", "data", "diary-data.json");
// ==========================

if (!STRAPI_TOKEN) {
	console.warn("⚠️  未设置 STRAPI_TOKEN，将尝试公开访问（可能失败）");
}

const axiosInstance = axios.create({
	baseURL: STRAPI_URL,
	headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
	timeout: 30000,
});

/**
 * 转义 YAML 字符串值
 */
function escapeYaml(value) {
	if (value === null || value === undefined) return '""';
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return String(value);
	if (Array.isArray(value)) {
		const items = value.map((v) => {
			const s = String(v);
			if (/[:#"'\n\[\]{}]/.test(s) || s === "") {
				return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
			}
			return s;
		});
		return `[${items.join(", ")}]`;
	}
	// 字符串
	const str = String(value);
	if (str === "") return '""';
	// 需要加引号的情况：特殊字符、纯数字、布尔值、null、yes/no、on/off
	if (
		/[:#"'\n\[\]{}]|^\s|\s$/.test(str) ||
		/^-?\d+(\.\d+)?$/.test(str) ||
		/^(true|false|null|yes|no|on|off)$/i.test(str)
	) {
		return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
	}
	return str;
}

/**
 * 从 Strapi 文章数据生成 frontmatter
 */
function generateFrontmatter(post) {
	const fields = [
		"title",
		"published",
		"updated",
		"draft",
		"description",
		"image",
		"tags",
		"category",
		"lang",
		"pinned",
		"comment",
		"priority",
		"author",
		"sourceLink",
		"licenseName",
		"licenseUrl",
		"encrypted",
		"password",
		"passwordHint",
		"alias",
		"permalink",
	];

	const lines = ["---"];
	for (const field of fields) {
		let value = post[field];

		// 跳过空值（但保留 false 和 0）
		if (value === null || value === undefined || value === "") {
			continue;
		}

		// 处理媒体字段（image）
		if (field === "image" && typeof value === "object" && value !== null) {
			value = value.url || value.formats?.medium?.url || "";
			if (!value) continue;
			// 如果是相对路径，加上 Strapi 域名
			if (value.startsWith("/")) {
				value = STRAPI_URL + value;
			}
		}

		lines.push(`${field}: ${escapeYaml(value)}`);
	}
	lines.push("---");
	return lines.join("\n");
}

/**
 * 从 Strapi 分页获取所有文章
 */
async function fetchAllPosts() {
	const allPosts = [];
	let page = 1;
	const pageSize = 50;

	while (true) {
		const response = await axiosInstance.get("/api/posts", {
			params: {
				"pagination[page]": page,
				"pagination[pageSize]": pageSize,
			},
		});

		const { data, meta } = response.data;
		allPosts.push(...data);

		if (meta.pagination.page >= meta.pagination.pageCount) {
			break;
		}
		page++;
	}

	return allPosts;
}

/**
 * 从 Strapi 分页获取所有日记
 */
async function fetchAllDiaries() {
	const allDiaries = [];
	let page = 1;
	const pageSize = 50;

	while (true) {
		const response = await axiosInstance.get("/api/diaries", {
			params: {
				"pagination[page]": page,
				"pagination[pageSize]": pageSize,
				populate: "*",
			},
		});

		const { data, meta } = response.data;
		allDiaries.push(...data);

		if (meta.pagination.page >= meta.pagination.pageCount) {
			break;
		}
		page++;
	}

	return allDiaries;
}

/**
 * 提取 Strapi 媒体对象的 URL
 * 优先取大图，没有则取原图
 */
function getImageUrl(image) {
	if (!image) return null;
	const url =
		image.formats?.large?.url ||
		image.formats?.medium?.url ||
		image.formats?.small?.url ||
		image.formats?.thumbnail?.url ||
		image.url;
	if (!url) return null;
	return url.startsWith("/") ? STRAPI_URL + url : url;
}

/**
 * 将 Strapi 日记数据转换为前端 DiaryItem 格式
 */
function transformDiaryData(diaries) {
	return diaries.map((diary) => {
		const item = {
			id: diary.id,
			content: diary.content || "",
			date: diary.date || new Date().toISOString(),
		};

		// 处理图片：把 Strapi 媒体对象转成 URL 数组
		if (
			diary.images &&
			Array.isArray(diary.images) &&
			diary.images.length > 0
		) {
			const urls = diary.images.map(getImageUrl).filter(Boolean);
			if (urls.length > 0) {
				item.images = urls;
			}
		}

		// 可选的文字字段
		if (diary.location) item.location = diary.location;
		if (diary.mood) item.mood = diary.mood;
		if (Array.isArray(diary.tags) && diary.tags.length > 0) {
			item.tags = diary.tags;
		}

		return item;
	});
}

/**
 * 主函数
 */
async function main() {
	console.log("========================================");
	console.log("  从 Strapi 同步文章到本地");
	console.log("========================================");
	console.log(`Strapi: ${STRAPI_URL}`);
	console.log(`输出:   ${POSTS_DIR}\n`);

	try {
		const posts = await fetchAllPosts();
		console.log(`获取到 ${posts.length} 篇文章\n`);

		// 确保目录存在
		if (!fs.existsSync(POSTS_DIR)) {
			fs.mkdirSync(POSTS_DIR, { recursive: true });
		}

		// 清空现有文章目录（避免残留）
		const existingFiles = fs
			.readdirSync(POSTS_DIR)
			.filter((f) => f.endsWith(".md"));
		for (const f of existingFiles) {
			fs.unlinkSync(path.join(POSTS_DIR, f));
		}
		if (existingFiles.length > 0) {
			console.log(`已清空 ${existingFiles.length} 个旧文件\n`);
		}

		let success = 0;
		for (const post of posts) {
			const slug = post.slug || `post-${post.id}`;
			const content = post.content || "";

			const frontmatter = generateFrontmatter(post);
			const fullContent = frontmatter + "\n\n" + content.trim() + "\n";

			const filePath = path.join(POSTS_DIR, `${slug}.md`);
			fs.writeFileSync(filePath, fullContent, "utf-8");
			console.log(`  ✓ ${slug}.md`);
			success++;
		}

		console.log(`\n✅ 同步完成：${success} 篇文章已写入`);

		// ========== 同步日记 ==========
		console.log("\n同步日记数据...");
		try {
			const diaries = await fetchAllDiaries();
			console.log(`获取到 ${diaries.length} 条日记`);

			const diaryData = transformDiaryData(diaries);

			// 确保目录存在
			const diaryDir = path.dirname(DIARY_DATA_PATH);
			if (!fs.existsSync(diaryDir)) {
				fs.mkdirSync(diaryDir, { recursive: true });
			}

			fs.writeFileSync(
				DIARY_DATA_PATH,
				JSON.stringify(diaryData, null, 2),
				"utf-8",
			);
			console.log(`✅ 日记同步完成：${diaryData.length} 条已写入`);
		} catch (error) {
			console.error("❌ 日记同步失败：", error.message);
			// 不阻断构建，继续执行
		}
	} catch (error) {
		console.error("\n❌ 同步失败：", error.message);
		if (error.response) {
			console.error("状态码：", error.response.status);
			console.error("响应：", JSON.stringify(error.response.data));
		}
		console.error(
			"\n提示：请确认 Strapi 服务已启动，且 STRAPI_URL 和 STRAPI_TOKEN 配置正确。",
		);
		// 不退出，让构建可以继续使用现有文件
		process.exit(0);
	}
}

main();
