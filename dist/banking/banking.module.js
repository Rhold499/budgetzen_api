"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingModule = void 0;
const common_1 = require("@nestjs/common");
const banking_service_1 = require("./banking.service");
const banking_controller_1 = require("./banking.controller");
const transactions_module_1 = require("../transactions/transactions.module");
const accounts_module_1 = require("../accounts/accounts.module");
const plans_module_1 = require("../plans/plans.module");
let BankingModule = class BankingModule {
};
exports.BankingModule = BankingModule;
exports.BankingModule = BankingModule = __decorate([
    (0, common_1.Module)({
        imports: [transactions_module_1.TransactionsModule, accounts_module_1.AccountsModule, plans_module_1.PlansModule],
        controllers: [banking_controller_1.BankingController],
        providers: [banking_service_1.BankingService],
        exports: [banking_service_1.BankingService],
    })
], BankingModule);
//# sourceMappingURL=banking.module.js.map