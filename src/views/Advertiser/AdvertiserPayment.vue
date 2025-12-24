<script setup lang="ts">
import valid from 'card-validator';
import type { FormInstance, FormRules } from 'element-plus';
import {
    type PaymentMethod,
    advAddPaymentMethodApi,
    advGetPaymentMethodsApi,
} from '@/apis/advApis';

const loading = ref(false);
const paymentMethods = ref<PaymentMethod[]>([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = useTemplateRef<FormInstance>('formRef');

const form = reactive({
    bankName: '',
    cardNumber: '',
});

const cardLogos: Record<string, string> = {
    visa: 'https://img.icons8.com/color/48/visa.png',
    mastercard: 'https://img.icons8.com/color/48/mastercard.png',
    unionpay: 'https://img.icons8.com/color/48/unionpay.png',
    jcb: 'https://img.icons8.com/color/48/jcb.png',
    'american-express': 'https://img.icons8.com/color/48/amex.png',
    discover: 'https://img.icons8.com/color/48/discover.png',
    diners: 'https://img.icons8.com/color/48/diners-club.png',
    maestro: 'https://img.icons8.com/color/48/maestro.png',
};

const currentCardType = ref('');

const currentCardLogo = computed(() => {
    if (currentCardType.value && cardLogos[currentCardType.value]) {
        return cardLogos[currentCardType.value];
    }
    return '';
});

const rules = reactive<FormRules>({
    bankName: [{ required: true, message: '请输入银行名称', trigger: 'change' }],
    cardNumber: [
        {
            required: true,
            validator: (_, value, callback) => {
                if (!value) {
                    currentCardType.value = '';
                    callback('请输入卡号');
                    return;
                }

                const validation = valid.number(value, { luhnValidateUnionPay: true });

                if (validation.card) {
                    currentCardType.value = validation.card.type;
                } else {
                    currentCardType.value = '';
                }

                if (!validation.isValid) {
                    callback('请输入有效的银行卡号');
                } else {
                    callback();
                }
            },
            trigger: ['blur', 'change'],
        },
    ],
});

const fetchPaymentMethods = async () => {
    loading.value = true;
    try {
        const res = await advGetPaymentMethodsApi();
        paymentMethods.value = res.data;
    } catch (error) {
        ElMessage.error(`获取支付方式失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleAdd = () => {
    formRef.value?.resetFields();
    currentCardType.value = '';
    dialogVisible.value = true;
};

const handleSubmit = async () => {
    if (!formRef.value) return;
    try {
        await formRef.value.validate();
    } catch {
        return;
    }
    submitLoading.value = true;
    try {
        await advAddPaymentMethodApi({
            bankName: form.bankName,
            cardNumber: form.cardNumber,
        });
        ElMessage.success('添加支付方式成功');
        dialogVisible.value = false;
        fetchPaymentMethods();
    } catch (error) {
        ElMessage.error(`添加支付方式失败：${(error as Error).message}`);
    } finally {
        submitLoading.value = false;
    }
};

onMounted(() => {
    fetchPaymentMethods();
});
</script>

<template>
    <div class="payment-container">
        <div class="header-section">
            <h2>支付方式管理</h2>
            <ElButton type="primary" @click="handleAdd">
                <ElIcon class="mr-1"><Plus /></ElIcon>添加支付方式
            </ElButton>
        </div>

        <ElTable v-loading="loading" :data="paymentMethods" style="width: 100%" border>
            <ElTableColumn prop="bankName" label="银行名称" />
            <ElTableColumn prop="cardNumber" label="卡号" />
        </ElTable>

        <ElDialog v-model="dialogVisible" title="添加支付方式" width="500px">
            <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
                <ElFormItem label="银行名称" prop="bankName">
                    <ElInput v-model="form.bankName" placeholder="请输入银行名称" />
                </ElFormItem>
                <ElFormItem label="卡号" prop="cardNumber">
                    <ElInput v-model="form.cardNumber" placeholder="请输入卡号">
                        <template #suffix>
                            <img
                                v-if="currentCardLogo"
                                :src="currentCardLogo"
                                class="cardLogo"
                                :alt="
                                    currentCardType ? `${currentCardType} card` : 'Bank card logo'
                                "
                            />
                        </template>
                    </ElInput>
                </ElFormItem>
            </ElForm>
            <template #footer>
                <span class="dialog-footer">
                    <ElButton @click="dialogVisible = false">取消</ElButton>
                    <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
                        确定
                    </ElButton>
                </span>
            </template>
        </ElDialog>
    </div>
</template>

<style scoped lang="scss">
.payment-container {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #303133;
        }
    }

    .cardLogo {
        height: 24px;
    }
}

.mr-1 {
    margin-right: 4px;
}
</style>
