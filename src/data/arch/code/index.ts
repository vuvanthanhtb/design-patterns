/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { ExampleCode } from "@/lib/types";
import { apiGateway } from "./api-gateway";
import { circuitBreaker } from "./circuit-breaker";
import { cleanArchitecture } from "./clean-architecture";
import { cqrs } from "./cqrs";
import { eventDriven } from "./event-driven";
import { eventSourcing } from "./event-sourcing";
import { hexagonal } from "./hexagonal";
import { layered } from "./layered";
import { microservices } from "./microservices";
import { mvc } from "./mvc";
import { saga } from "./saga";
import { serverless } from "./serverless";
import { serviceMesh } from "./service-mesh";
import { stranglerFig } from "./strangler-fig";

export const ARCH_CODE: Record<string, ExampleCode> = {
  "api-gateway": apiGateway,
  "circuit-breaker": circuitBreaker,
  "clean-architecture": cleanArchitecture,
  cqrs: cqrs,
  "event-driven": eventDriven,
  "event-sourcing": eventSourcing,
  hexagonal: hexagonal,
  layered: layered,
  microservices: microservices,
  mvc: mvc,
  saga: saga,
  serverless: serverless,
  "service-mesh": serviceMesh,
  "strangler-fig": stranglerFig,
};
