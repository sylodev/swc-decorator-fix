import { IsString, IsNumber, validateSync, ValidateNested, IsDefined } from "class-validator";
import { plainToClass, Type } from "class-transformer";
import "reflect-metadata";

class Author {
  @IsString()
  name!: string;
}

class Post {
  @IsNumber()
  id = 0;

  @IsString()
  @Type(() => String)
  title!: string;

  @ValidateNested()
  @IsDefined()
  @Type(() => Author)
  author!: Author;
}

const post = plainToClass(Post, { id: 1, title: "test_title", author: { name: "Steve" } });
const error = validateSync(post);
if (error.length > 0) {
  console.log(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

console.log({ success: true, post });
console.log("yeet");
