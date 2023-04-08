import fs from 'fs';
import util from 'util'
import process from 'child_process'

import { JSDOM } from 'jsdom'

const exec = util.promisify(process.exec)

const USER_ID = '4459274891717223' // 掘金用户 ID

// 1. 拉取页面
const { stdout: body } = await exec(`curl https://juejin.cn/user/${USER_ID}/posts`)

// 2. 使用 jsdom 解析 HTML
const dom = await new JSDOM(body)

// 3. 生成 html
const htmlText = [...dom.window.document.querySelectorAll('.detail-list .post-list-box .entry-list .entry')]
  .reduce((total, ele) => {
    const data = ele.querySelector('.meta-container .date')?.textContent 
    const link = ele.querySelector('.content-wrapper .title-row a.title')
    return `${total}\n<li>[${data}] <a href="https://juejin.cn${link?.getAttribute('href')}">${link?.textContent}</a></li>`
  }, '')

// 4. 读取
const README_PATH = new URL('./README.md', import.meta.url)

// 5. 去 README 内容, 在 <!-- posts start --> 和 <!-- posts end --> 中间插入生成的 html
const res = fs.readFileSync(README_PATH, 'utf-8')
  .replace(/(?<=\<\!-- posts start --\>)[.\s\S]*?(?=\<\!-- posts end --\>)/, `\n<ul>${htmlText}\n</ul>\n`)
  
// 6. 修改 README
fs.writeFileSync(README_PATH, res)
