import { getSession } from "@/server/auth/session";
import { getEvaluationService } from "@/server/container";
import {
  createCreateEvaluationHandler,
  createListEvaluationsHandler,
} from "@/server/http/evaluations-handler";

export const GET = createListEvaluationsHandler(getEvaluationService);
export const POST = createCreateEvaluationHandler(
  getEvaluationService,
  getSession,
);
