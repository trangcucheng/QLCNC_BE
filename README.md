# PMTS_BE

## Install

- nodejs v14.19.1
- docker ver 20.10.17
- mysql ver 8.0.30
- pm2

## Thứ tự

- tạo file .env theo hướng dẫn .env.example => Command: cp .env.example .env (Ubuntu)
- npm i
- sudo docker-compose up -d (Dùng để chạy database mysql và mongoDB)
- Optional: - sudo docker-compose down (Dừng chạy các container - sử dụng nếu có thay đổi file Docker compose)
- npm run build
- npm run migration:run
- npm run migration:revert
- npm run start:dev

## Cấu trúc code

1.  table_name -> (controller, service, module, repository, dto)

> Note: Mỗi table tương ứng 1 folder bao gồm các file:

- Tạo file migration: npx typeorm migration:create -n newMigration
- Tạo module mới: npx @nestjs/cli g mo table_name
- Tạo controller mới: npx @nestjs/cli g controller table_name
- Tạo service mới: npx @nestjs/cli g service table_name
- file repository
- folder dto
