import { IsString, IsNumber, validateSync } from "class-validator";
import { plainToClass } from "class-transformer";

export class Test {
  @IsNumber()
  id = 0;

  @IsString()
  title!: string;
}

const cls = plainToClass(Test, { id: 1, title: "test_title" });
const error = validateSync(cls);
if (error.length > 0) {
  console.log(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

console.log({ success: true, cls });
