import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/lib/types";

interface Props {
  projectValue: number;
  advancePaymentPercentage: number;
  workGuaranteePercentage: number;
  materialDeliveryPaymentPercentage: number;
  completedWorkPaymentPercentage: number;
  items: ProjectItem[];
}

interface ManualDiscount {
  name: string;
  value: number;
}

interface ManualAddition {
  name: string;
  value: number;
}

const ExtractSummaryPage: React.FC<Props> = ({
  projectValue,
  advancePaymentPercentage,
  workGuaranteePercentage,
  materialDeliveryPaymentPercentage,
  completedWorkPaymentPercentage,
  items,
}) => {
  const [manualDiscounts, setManualDiscounts] = useState<ManualDiscount[]>([]);
  const [manualAdditions, setManualAdditions] = useState<ManualAddition[]>([]);

  // هنا غيرنا القيمة من number إلى string للتحكم في الحقل
  const [newDiscount, setNewDiscount] = useState({ name: "", value: "" });
  const [newAddition, setNewAddition] = useState({ name: "", value: "" });

  const [discountsVisible, setDiscountsVisible] = useState(false);

  // دالة مساعدة لتنسيق الأرقام أو إظهار "-" إذا كانت القيمة غير موجودة
  const formatNumber = (num?: number) =>
    num !== undefined && num !== null ? num.toLocaleString() : "-";

  // حساب نسبة التوريد والإنجاز بناء على وزن كل بند
  const totalSupplyProgress = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.supplyProgress || 0) * (item.weight || 0),
        0
      ),
    [items]
  );

  const totalWorkProgress = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.progress || 0) * (item.weight || 0),
        0
      ),
    [items]
  );

  // حساب قيمة المستخلص من التوريد والإنجاز
  const materialValue =
    totalSupplyProgress * projectValue * (materialDeliveryPaymentPercentage / 100);
  const workValue =
    totalWorkProgress * projectValue * (completedWorkPaymentPercentage / 100);
  const totalExtract = materialValue + workValue;

  // الخصومات التلقائية (محسوبة على قيمة المستخلص)
  const advanceDiscount = totalExtract * (advancePaymentPercentage / 100);
  const guaranteeDiscount = totalExtract * (workGuaranteePercentage / 100);

  // تجميع الخصومات: التلقائية + اليدوية (خصومات مستخلصات سابقة + تعليه + سوء مصنعية + أخرى)
  const allDiscounts: ManualDiscount[] = [
    { name: "دفعة مقدمة", value: advanceDiscount },
    { name: "ضمان أعمال", value: guaranteeDiscount },
    ...manualDiscounts,
  ];

  // مجموع كل الخصومات (تلقائية + يدوية)
  const totalDiscounts = allDiscounts.reduce((sum, d) => sum + d.value, 0);

  // مجموع الإضافات اليدوية
  const manualAdditionsTotal = manualAdditions.reduce(
    (sum, a) => sum + a.value,
    0
  );

  // القيمة النهائية المستحقة للدفع
  const netExtract = totalExtract - totalDiscounts + manualAdditionsTotal;

  // إضافة خصم يدوي جديد (خصم مستخلص سابق، تعليه، سوء مصنعية، أو أخرى)
  const addDiscount = () => {
    if (newDiscount.name && Number(newDiscount.value) > 0) {
      setManualDiscounts([
        ...manualDiscounts,
        { name: newDiscount.name, value: Number(newDiscount.value) },
      ]);
      setNewDiscount({ name: "", value: "" });
    }
  };

  // إضافة بند إضافي يدوي جديد
  const addAddition = () => {
    if (newAddition.name && Number(newAddition.value) > 0) {
      setManualAdditions([
        ...manualAdditions,
        { name: newAddition.name, value: Number(newAddition.value) },
      ]);
      setNewAddition({ name: "", value: "" });
    }
  };

  // حذف خصم يدوي فقط (خصومات مستخلصات سابقة، تعليه، سوء مصنعية، وغيرها)
  const removeManualDiscount = (index: number) => {
    setManualDiscounts(manualDiscounts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* ملخص بيانات المشروع */}
      <Card className="p-4 space-y-3">
        <h2 className="text-xl font-bold">ملخص بيانات المشروع</h2>
        <p>قيمة المشروع: {formatNumber(projectValue)} ج.م</p>
        <p>نسبة التوريد: {totalSupplyProgress.toFixed(2)}%</p>
        <p>نسبة إنجاز الأعمال: {totalWorkProgress.toFixed(2)}%</p>
      </Card>

      {/* قيمة المستخلص */}
      <Card className="p-4 space-y-3">
        <h2 className="text-xl font-bold">قيمة المستخلص</h2>
        <p>توريد المواد: {formatNumber(materialValue)} ج.م</p>
        <p>الأعمال المنجزة: {formatNumber(workValue)} ج.م</p>
        <p className="font-bold">الإجمالي: {formatNumber(totalExtract)} ج.م</p>
      </Card>

      {/* قائمة الخصومات المنسدلة */}
      <Card className="p-4 space-y-3">
        <h2
          className="text-xl font-bold cursor-pointer select-none"
          onClick={() => setDiscountsVisible(!discountsVisible)}
        >
          الخصومات {discountsVisible ? "▲" : "▼"}
        </h2>

        {discountsVisible && (
          <>
            {/* عرض كل الخصومات التلقائية + اليدوية */}
            {allDiscounts.map((d, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border rounded p-2 my-1"
              >
                <span>{d.name}</span>
                <div className="flex items-center gap-2">
                  <span>{formatNumber(d.value)} ج.م</span>

                  {/* إمكانية حذف خصومات يدوية فقط (من بعد idx 1) */}
                  {idx >= 2 && (
                    <button
                      onClick={() => removeManualDiscount(idx - 2)}
                      className="text-red-600 hover:text-red-800 font-bold"
                      title="حذف خصم"
                    >
                      ✖
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* إضافة خصم يدوي */}
            <div className="flex flex-wrap gap-2 items-end mt-3">
              <select
                value={newDiscount.name}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, name: e.target.value })
                }
                className="border rounded px-3 py-2"
              >
                <option value="">اختر نوع الخصم</option>
                <option value="خصم مستخلص سابق">خصم مستخلص سابق</option>
                <option value="تعليه">تعليه</option>
                <option value="سوء مصنعية">سوء مصنعية</option>
                <option value="أخرى">أخرى</option>
              </select>

              <Input
                placeholder="القيمة"
                type="number"
                value={newDiscount.value}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewDiscount({ ...newDiscount, value: val === "0" ? "" : val });
                }}
              />

              <Button onClick={addDiscount}>إضافة خصم</Button>
            </div>

            <p className="font-bold mt-4">
              مجموع الخصومات: {formatNumber(totalDiscounts)} ج.م
            </p>
          </>
        )}
      </Card>

      {/* الإضافات اليدوية */}
      <Card className="p-4 space-y-3">
        <h2 className="text-xl font-bold">الإضافات</h2>
        {manualAdditions.map((a, idx) => (
          <p key={idx}>
            {a.name}: {formatNumber(a.value)} ج.م
          </p>
        ))}
        <div className="flex gap-2 items-end">
          <Input
            placeholder="اسم البند"
            value={newAddition.name}
            onChange={(e) => setNewAddition({ ...newAddition, name: e.target.value })}
          />
          <Input
            placeholder="القيمة"
            type="number"
            value={newAddition.value}
            onChange={(e) => {
              const val = e.target.value;
              setNewAddition({ ...newAddition, value: val === "0" ? "" : val });
            }}
          />
          <Button onClick={addAddition}>إضافة بند</Button>
        </div>
        <p className="font-bold">مجموع الإضافات: {formatNumber(manualAdditionsTotal)} ج.م</p>
      </Card>

      {/* القيمة المستحقة للدفع */}
      <Card className="p-4">
        <h2 className="text-xl font-bold">القيمة المستحقة للدفع</h2>
        <p className="text-2xl text-green-700 font-bold">{formatNumber(netExtract)} ج.م</p>
      </Card>
    </div>
  );
};

export default ExtractSummaryPage;
