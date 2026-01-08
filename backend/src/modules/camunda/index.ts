import CamundaService from "./service";
import { Module } from "@medusajs/framework/utils";

export const CAMUNDA_MODULE = "camundaService";

export default Module(CAMUNDA_MODULE, {
    service: CamundaService,
});
