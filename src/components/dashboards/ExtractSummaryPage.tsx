import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/lib/types";
import { 
  Calculator, 
  DollarSign, 
  Minus, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Receipt,
  TrendingUp,
  FileText,
  Trash2
} from "lucide-react";

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
  const [newDiscount, setNewDiscount] = useState({ name: "", value: "" });
  const [newAddition, setNewAddition] = useState({ name: "", value: "" });
  const [discountsVisible, setDiscountsVisible] = useState(false);
  const [additionsVisible, setAdditionsVisible] = useState(false);

  // Helper function to format numbers
  const formatNumber = (num?: number) =>
    num !== undefined && num !== null ? num.toLocaleString("ar-EG") : "-";

  // Calculate supply and work progress based on item weights
  const totalSupplyProgress = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.supplyprogress || 0) * (item.weight || 0),
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

  // Calculate extract values
  const materialValue = (totalSupplyProgress / 100) * projectValue * (materialDeliveryPaymentPercentage / 100);
  const workValue = (totalWorkProgress / 100) * projectValue * (completedWorkPaymentPercentage / 100);
  const totalExtract = materialValue + workValue;

  // Automatic discounts (calculated on extract value)
  const advanceDiscount = totalExtract * (advancePaymentPercentage / 100);
  const guaranteeDiscount = totalExtract * (workGuaranteePercentage / 100);

  // All discounts: automatic + manual
  const allDiscounts: ManualDiscount[] = [
    { name: "خصم دفعة مقدمة", value: advanceDiscount },
    { name: "خصم ضمان أعمال", value: guaranteeDiscount },
    ...manualDiscounts,
  ];

  const totalDiscounts = allDiscounts.reduce((sum, d) => sum + d.value, 0);
  const manualAdditionsTotal = manualAdditions.reduce((sum, a) => sum + a.value, 0);
  const netExtract = totalExtract - totalDiscounts + manualAdditionsTotal;

  // Add manual discount
  const addDiscount = () => {
    if (newDiscount.name && Number(newDiscount.value) > 0) {
      setManualDiscounts([
        ...manualDiscounts,
        { name: newDiscount.name, value: Number(newDiscount.value) },
      ]);
      setNewDiscount({ name: "", value: "" });
    }
  };

  // Add manual addition
  const addAddition = () => {
    if (newAddition.name && Number(newAddition.value) > 0) {
      setManualAdditions([
        ...manualAdditions,
        { name: newAddition.name, value: Number(newAddition.value) },
      ]);
      setNewAddition({ name: "", value: "" });
    }
  };

  // Remove manual discount
  const removeManualDiscount = (index: number) => {
    setManualDiscounts(manualDiscounts.filter((_, i) => i !== index));
  };

  // Remove manual addition
  const removeManualAddition = (index: number) => {
    setManualAdditions(manualAdditions.filter((_, i) => i !== index));
  };

  // Don't show if no project value or no items
  if (!projectValue || items.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500 mt-6">
        <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">حساب المستخلص</h3>
        <p>سيتم عرض حساب المستخلص عند إضافة بنود للمشروع وتحديد قيمة تعاقدية</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">حساب المستخلص</h2>
          <p className="text-sm text-gray-600">حساب قيمة المستخلص والخصومات والإضافات</p>
        </div>
      </div>

      {/* Progress and Project Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Summary */}
        <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            نسب التقدم
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">نسبة التوريد:</span>
              <span className="text-xl font-bold text-blue-600">
                {totalSupplyProgress.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">نسبة إنجاز الأعمال:</span>
              <span className="text-xl font-bold text-green-600">
                {totalWorkProgress.toFixed(2)}%
              </span>
            </div>
            <div className="pt-3 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">قيمة المشروع:</span>
                <span className="text-lg font-bold text-gray-800">
                  {formatNumber(projectValue)} ج.م
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Extract Calculation */}
        <Card className="p-6 shadow-sm border-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            قيمة المستخلص
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">
                توريد المواد ({materialDeliveryPaymentPercentage}%):
              </span>
              <span className="font-semibold text-blue-600">
                {formatNumber(materialValue)} ج.م
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">
                الأعمال المنجزة ({completedWorkPaymentPercentage}%):
              </span>
              <span className="font-semibold text-green-600">
                {formatNumber(workValue)} ج.م
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-bold text-gray-800">إجمالي المستخلص:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatNumber(totalExtract)} ج.م
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Discounts Section */}
      <Card className="p-6 shadow-sm border-0 bg-white">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          onClick={() => setDiscountsVisible(!discountsVisible)}
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Minus className="w-5 h-5 text-red-600" />
            الخصومات
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-red-600">
              -{formatNumber(totalDiscounts)} ج.م
            </span>
            {discountsVisible ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {discountsVisible && (
          <div className="mt-6 space-y-4">
            {/* Display all discounts */}
            {allDiscounts.map((discount, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100"
              >
                <span className="text-gray-700 font-medium">{discount.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600">
                    -{formatNumber(discount.value)} ج.م
                  </span>
                  {idx >= 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeManualDiscount(idx - 2)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add new discount */}
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="font-medium text-gray-700 mb-3">إضافة خصم جديد</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={newDiscount.name}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, name: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">اختر نوع الخصم</option>
                  <option value="خصم مستخلص سابق">خصم مستخلص سابق</option>
                  <option value="تعليه">تعليه</option>
                  <option value="سوء مصنعية">سوء مصنعية</option>
                  <option value="غرامة تأخير">غرامة تأخير</option>
                  <option value="أخرى">أخرى</option>
                </select>

                <Input
                  placeholder="القيمة بالجنيه"
                  type="number"
                  value={newDiscount.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewDiscount({ ...newDiscount, value: val === "0" ? "" : val });
                  }}
                  className="focus:ring-2 focus:ring-red-500"
                />

                <Button 
                  onClick={addDiscount}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!newDiscount.name || !newDiscount.value}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة خصم
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Additions Section */}
      <Card className="p-6 shadow-sm border-0 bg-white">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          onClick={() => setAdditionsVisible(!additionsVisible)}
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            الإضافات
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-green-600">
              +{formatNumber(manualAdditionsTotal)} ج.م
            </span>
            {additionsVisible ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {additionsVisible && (
          <div className="mt-6 space-y-4">
            {/* Display all additions */}
            {manualAdditions.length > 0 ? (
              manualAdditions.map((addition, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100"
                >
                  <span className="text-gray-700 font-medium">{addition.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600">
                      +{formatNumber(addition.value)} ج.م
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeManualAddition(idx)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h4 className="font-medium mb-2">لا توجد إضافات</h4>
                <p className="text-sm">أضف بنود إضافية مثل البونص أو التعديلات على العقد</p>
              </div>
            )}

            {/* Add new addition */}
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="font-medium text-gray-700 mb-3">إضافة بند جديد</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="اسم البند الإضافي"
                  value={newAddition.name}
                  onChange={(e) => setNewAddition({ ...newAddition, name: e.target.value })}
                  className="focus:ring-2 focus:ring-green-500"
                />
                <Input
                  placeholder="القيمة بالجنيه"
                  type="number"
                  value={newAddition.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewAddition({ ...newAddition, value: val === "0" ? "" : val });
                  }}
                  className="focus:ring-2 focus:ring-green-500"
                />
                <Button 
                  onClick={addAddition}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newAddition.name || !newAddition.value}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة بند
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Final Net Amount */}
      <Card className="p-6 shadow-lg border-0 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            المبلغ المستحق للدفع
          </h3>
          <div className="text-4xl font-bold text-emerald-600 mb-4">
            {formatNumber(netExtract)} ج.م
          </div>
          <p className="text-sm text-gray-600 mb-4">
            المبلغ النهائي بعد الخصومات والإضافات
          </p>
          
          {/* Calculation breakdown */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">إجمالي المستخلص:</span>
              <span className="font-medium text-gray-800">+{formatNumber(totalExtract)} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">إجمالي الخصومات:</span>
              <span className="font-medium text-red-600">-{formatNumber(totalDiscounts)} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">إجمالي الإضافات:</span>
              <span className="font-medium text-green-600">+{formatNumber(manualAdditionsTotal)} ج.م</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between font-bold">
                <span className="text-gray-800">المبلغ النهائي:</span>
                <span className="text-emerald-600">{formatNumber(netExtract)} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExtractSummaryPage;