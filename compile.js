import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 扫描目录并生成JSON结构
function scanImageDirectory() {
    const imageDir = path.join(__dirname, 'image');
    const result = new Map();

    // 生成理想顺序的区名数组
    const chineseNumbers = [
        '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十', '三十一'
    ];
    const idealOrder = chineseNumbers.map(num => num + '区');

    try {
        // 检查 image 目录是否存在
        if (!fs.existsSync(imageDir)) {
            console.log('image 目录不存在');
            return;
        }

        // 读取 image 目录下的所有一级目录
        let firstLevelDirs = fs.readdirSync(imageDir).filter(item => {
            const itemPath = path.join(imageDir, item);
            return fs.statSync(itemPath).isDirectory();
        });

        // 按照理想顺序排序
        firstLevelDirs = idealOrder.filter(dir => firstLevelDirs.includes(dir));

        // 为每个一级目录扫描文件
        firstLevelDirs.forEach(dir => {
            const dirPath = path.join(imageDir, dir);
            result.set(dir, scanDirectoryRecursively(dirPath, dirPath));
        });

        // 将结果写入JavaScript模块文件
        const outputPath = path.join(__dirname, 'src/data/imageData.js');

        // 确保目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 保证对象key顺序
        const orderedObject = Object.fromEntries(result);
        const moduleContent = `// 此文件由 compile.js 自动生成，请勿手动修改
export const imageData = ${JSON.stringify(orderedObject, null, 2)};

export default imageData;
`;

        fs.writeFileSync(outputPath, moduleContent, 'utf8');
    } catch (error) {
        console.error('扫描过程中出现错误:', error);
    }
}

// 递归扫描目录中的所有文件
function scanDirectoryRecursively(dirPath, basePath) {
    const files = [];

    try {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isFile()) {
                // 获取相对于基础路径的文件路径
                const relativePath = path.relative(basePath, itemPath);
                files.push(relativePath);
            } else if (stat.isDirectory()) {
                // 递归扫描子目录
                const subFiles = scanDirectoryRecursively(itemPath, basePath);
                files.push(...subFiles);
            }
        });
    } catch (error) {
        console.error(`扫描目录 ${dirPath} 时出错:`, error);
    }

    return files;
}

// 执行扫描
scanImageDirectory();