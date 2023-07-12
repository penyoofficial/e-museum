import { existsSync, statSync, readdirSync, rmdirSync, unlinkSync } from 'fs'
import { resolve, join } from 'path'

function deletePaths(paths) {
    paths.forEach((filePath) => {
        try {
            const absolutePath = resolve(filePath)
            if (existsSync(absolutePath)) {
                const stats = statSync(absolutePath)
                if (stats.isDirectory()) {
                    readdirSync(absolutePath).forEach((file) => {
                        deletePaths([join(absolutePath, file)])
                    })
                    rmdirSync(absolutePath)
                } else
                    unlinkSync(absolutePath)
                console.log(`Deleted: ${filePath}`)
            } else
                console.log(`File not found: ${filePath}`)
        } catch (error) {
            console.error(`Error deleting: ${filePath}`, error)
        }
    })
}

deletePaths([
    './dist',
    './node_modules',
    './temp',
    'package-lock.json'
])