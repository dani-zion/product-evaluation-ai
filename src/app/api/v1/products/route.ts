import { getProductService } from "@/server/container";
import {
  createCreateProductHandler,
  createListProductsHandler,
} from "@/server/http/products-handler";

export const GET = createListProductsHandler(getProductService);
export const POST = createCreateProductHandler(getProductService);
