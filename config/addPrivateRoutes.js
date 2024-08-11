const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
    // 检查源文件夹是否存在
    if (!fs.existsSync(source)) {
        console.log("源文件夹不存在");
        return;
    }

    // 检查目标文件夹是否存在，不存在则创建
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }

    // 读取源文件夹内容
    const files = fs.readdirSync(source);

    // 遍历源文件夹内容
    files.forEach(function(file) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        // 检查文件的类型
        if (fs.lstatSync(sourcePath).isDirectory()) {
            // 如果是文件夹，则递归调用复制文件夹函数
            copyFolderRecursiveSync(sourcePath, targetPath);
        } else {
            // 如果是文件，则直接复制到目标文件夹
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`复制文件: ${sourcePath} -> ${targetPath}`);
        }
    });
}

// 源文件夹和目标文件夹的路径
const sourceFolder = '/config/privateRoutes';
const targetFolder = '/app/lib/routes';

// 调用函数复制文件夹，将私有的路由ts文件复制过去
copyFolderRecursiveSync(sourceFolder, targetFolder);

// 读取 a.json 和 b.json 文件
const aData = JSON.parse(fs.readFileSync('/app/assets/build/routes.json', 'utf8'));
const bData = JSON.parse(fs.readFileSync('/config/privateRoutes.json', 'utf8'));

// 合并 b.json 到 a.json
const mergedData = { ...aData, ...bData };

// 将合并后的数据写入 a.json
fs.writeFileSync('/app/assets/build/routes.json', JSON.stringify(mergedData, null, 2));
console.log('合并完成！');
