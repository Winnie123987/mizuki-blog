import fs from "node:fs";
import path from "node:path";

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

// 从 Strapi 同步生成的 JSON 文件加载日记数据
// 构建时由 sync-from-strapi.js 生成 src/data/diary-data.json
let diaryData: DiaryItem[] = [];

try {
	const dataPath = path.join(process.cwd(), "src/data/diary-data.json");
	if (fs.existsSync(dataPath)) {
		const raw = fs.readFileSync(dataPath, "utf-8");
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			diaryData = parsed;
		}
	}
} catch (e) {
	console.warn("[Diary] Failed to load diary-data.json, using empty data");
}

// 获取日记列表（按时间倒序）
export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	if (limit && limit > 0) {
		return sortedData.slice(0, limit);
	}

	return sortedData;
};

// 获取所有标签
export const getAllTags = () => {
	const tags = new Set<string>();
	diaryData.forEach((item) => {
		if (item.tags) {
			item.tags.forEach((tag) => tags.add(tag));
		}
	});
	return Array.from(tags).sort();
};
