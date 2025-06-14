const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyPrivateRoutes() {
    // 源文件夹和目标文件夹的路径
    const sourceFolder = '/config/privateRoutes';
    const targetFolder = '/app/lib/routes';

    // 复制文件夹
    fs.cpSync(sourceFolder, targetFolder, { recursive: true });
    console.log(`成功复制文件夹: ${sourceFolder} -> ${targetFolder}`);
}

function isPrivateRouterExist() {
    // 源文件夹和目标文件夹的路径
    const sourceFolder = '/config/privateRoutes';
    const targetFolder = '/app/lib/routes';

    try {
        // 读取源文件夹中的所有文件
        const sourceFiles = [];
        function readDirRecursive(dir) {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    readDirRecursive(fullPath);
                } else {
                    sourceFiles.push(fullPath);
                }
            });
        }
        readDirRecursive(sourceFolder);

        // 检查目标文件夹中是否存在对应的文件、文件是否一致
        const missingFiles = [];
        const differentFiles = [];
        sourceFiles.forEach(sourceFile => {
            const relativePath = path.relative(sourceFolder, sourceFile);
            const targetFile = path.join(targetFolder, relativePath);
            if (!fs.existsSync(targetFile)) {
                missingFiles.push(relativePath);
            } else {
                const sourceContent = fs.readFileSync(sourceFile, 'utf8');
                const targetContent = fs.readFileSync(targetFile, 'utf8');
                if (sourceContent !== targetContent) {
                    differentFiles.push(relativePath);
                }
            }
        });

        if (missingFiles.length > 0) {
            console.log('以下文件在目标文件夹中不存在:');
            missingFiles.forEach(file => console.log(file));
            return false;
        }

        if (differentFiles.length > 0) {
            console.log('以下文件在目标文件夹中存在但内容不一致:');
            differentFiles.forEach(file => console.log(file));
            return false;
        }

        console.log('所有私有路由文件都已存在于目标文件夹中');
        return true;
    } catch (error) {
        console.error('检查私有路由文件时出错:', error);
        return false;
    }
} 

function build() {
    console.log('开始构建...');
    const buildResult = execSync('npm run build');
    console.log('构建完成:', buildResult.toString());
}

// 读取文件内容
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`读取文件 ${filePath} 时出错:`, error);
        return null;
    }
}

// 解析路由配置
function parseRoutes(content) {
    try {
        // 移除 export default 前缀
        const jsonStr = content.replace(/^export\s+default\s*/, '');
        
        // 处理 module 字段，将其转换为字符串
        const processedStr = jsonStr.replace(
            /"module":\s*\(\)\s*=>\s*import\('([^']+)'\)/g,
            '"module": "() => import(\'$1\')"'
        );
        
        return JSON.parse(processedStr);
    } catch (error) {
        console.error('解析路由配置时出错:', error);
        return null;
    }
}

// 合并路由配置
function mergeRoutes(routes, privateRoutes) {
    // 遍历私有路由
    for (const [key, value] of Object.entries(privateRoutes)) {
        if (routes[key]) {
            // 如果路由已存在，合并 routes 对象
            if (routes[key].routes && value.routes) {
                routes[key].routes = { ...routes[key].routes, ...value.routes };
            }
            // 更新其他属性
            routes[key] = { ...routes[key], ...value };
        } else {
            // 如果路由不存在，直接添加
            routes[key] = value;
        }
    }
    return routes;
}

// 写入文件
function writeFile(filePath, content) {
    try {
        // 将 module 字段从字符串转换回函数
        const contentStr = JSON.stringify(content, null, 2);
        const processedContent = contentStr.replace(
            /"module":\s*"\(\)\s*=>\s*import\('([^']+)'\)"/g,
            '"module": () => import(\'$1\')'
        );
        
        // 添加 export default 前缀
        const exportContent = `export default ${processedContent}`;
        fs.writeFileSync(filePath, exportContent);
        console.log(`成功写入文件: ${filePath}`);
    } catch (error) {
        console.error(`写入文件 ${filePath} 时出错:`, error);
    }
}

// 合并到 /app/assets/build/routes.js
function mergeJS() {
    const routesPath = '/app/assets/build/routes.js';
    const privateRoutesPath = '/config/privateRoutes.js';

    // 读取文件
    const routesContent = readFile(routesPath);
    const privateRoutesContent = readFile(privateRoutesPath);

    if (!routesContent || !privateRoutesContent) {
        console.error('无法读取文件内容');
        return;
    }

    // 解析路由配置
    const routes = parseRoutes(routesContent);
    const privateRoutes = parseRoutes(privateRoutesContent);

    if (!routes || !privateRoutes) {
        console.error('无法解析路由配置');
        return;
    }

    // 合并路由配置
    const mergedRoutes = mergeRoutes(routes, privateRoutes);

    // 写入文件
    writeFile(routesPath, mergedRoutes);
}

// 合并到 /app/assets/build/routes.json
function mergeJSON() {
    const routesPath = '/app/assets/build/routes.json';
    const privateRoutesPath = '/config/privateRoutes.json';

    // 读取文件
    const routesContent = readFile(routesPath);
    const privateRoutesContent = readFile(privateRoutesPath);

    if (!routesContent || !privateRoutesContent) {
        console.error('无法读取文件内容');
        return;
    }

    // 解析路由配置
    const routes = JSON.parse(routesContent);
    const privateRoutes = JSON.parse(privateRoutesContent);

    if (!routes || !privateRoutes) {
        console.error('无法解析路由配置');
        return;
    }

    // 合并路由配置
    const mergedRoutes = mergeRoutes(routes, privateRoutes);

    // 写入文件
    fs.writeFileSync('/app/assets/build/routes.json', JSON.stringify(mergedRoutes, null, 2));
    console.log(`成功写入文件: ${routesPath}`);
}

function getCurrentTime() {
    return `${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`;
}

if (isPrivateRouterExist() === false) {
    console.log(`[${getCurrentTime()}] 私有路由文件不存在，开始复制和构建`);
    mergeJS();
    mergeJSON();
    copyPrivateRoutes();
    console.log(`[${getCurrentTime()}] 私有路由文件复制完成，开始构建`);
    build();
    console.log(`[${getCurrentTime()}] 私有路由文件构建完成`);
} else {
    console.log(`[${getCurrentTime()}] 私有路由文件已存在，跳过复制和构建`);
}
