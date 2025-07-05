"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileModule = void 0;
const common_1 = require("@nestjs/common");
const mobile_service_1 = require("./mobile.service");
const mobile_controller_1 = require("./mobile.controller");
const transactions_module_1 = require("../transactions/transactions.module");
const accounts_module_1 = require("../accounts/accounts.module");
const users_module_1 = require("../users/users.module");
let MobileModule = class MobileModule {
};
exports.MobileModule = MobileModule;
exports.MobileModule = MobileModule = __decorate([
    (0, common_1.Module)({
        imports: [transactions_module_1.TransactionsModule, accounts_module_1.AccountsModule, users_module_1.UsersModule],
        controllers: [mobile_controller_1.MobileController],
        providers: [mobile_service_1.MobileService],
        exports: [mobile_service_1.MobileService],
    })
], MobileModule);
//# sourceMappingURL=mobile.module.js.map