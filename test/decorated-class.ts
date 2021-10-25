const MyDecorator = (): ClassDecorator => {
  return (target) => {
    console.log(target);
  };
};

@MyDecorator()
export class Test {}
