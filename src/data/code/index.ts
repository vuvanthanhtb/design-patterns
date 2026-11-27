import type { ExampleCode } from "@/lib/types";
import { abstractFactory } from "./abstract-factory";
import { adapter } from "./adapter";
import { bridge } from "./bridge";
import { builder } from "./builder";
import { chainOfResponsibility } from "./chain-of-responsibility";
import { command } from "./command";
import { composite } from "./composite";
import { decorator } from "./decorator";
import { facade } from "./facade";
import { factoryMethod } from "./factory-method";
import { flyweight } from "./flyweight";
import { interpreter } from "./interpreter";
import { iterator } from "./iterator";
import { mediator } from "./mediator";
import { memento } from "./memento";
import { observer } from "./observer";
import { prototype } from "./prototype";
import { proxy } from "./proxy";
import { singleton } from "./singleton";
import { state } from "./state";
import { strategy } from "./strategy";
import { templateMethod } from "./template-method";
import { visitor } from "./visitor";

export const EXAMPLES: Record<string, ExampleCode> = {
  "abstract-factory": abstractFactory,
  adapter: adapter,
  bridge: bridge,
  builder: builder,
  "chain-of-responsibility": chainOfResponsibility,
  command: command,
  composite: composite,
  decorator: decorator,
  facade: facade,
  "factory-method": factoryMethod,
  flyweight: flyweight,
  interpreter: interpreter,
  iterator: iterator,
  mediator: mediator,
  memento: memento,
  observer: observer,
  prototype: prototype,
  proxy: proxy,
  singleton: singleton,
  state: state,
  strategy: strategy,
  "template-method": templateMethod,
  visitor: visitor,
};
