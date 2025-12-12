import { create } from "zustand";

interface CartItem {
  id: string;
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

interface POSState {
  items: CartItem[];
  discount: number;
  discountType: "fixed" | "percentage";
  tax: number;
  paymentType: "cash" | "qris" | "transfer" | "ewallet" | "card";
  customerNotes: string;

  // Computed
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;

  // Actions
  addItem: (menu: { id: string; name: string; price: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemNotes: (id: string, notes: string) => void;
  setDiscount: (amount: number, type: "fixed" | "percentage") => void;
  setPaymentType: (type: POSState["paymentType"]) => void;
  setCustomerNotes: (notes: string) => void;
  clearCart: () => void;
}

const generateId = () =>
  `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const calculateTotals = (
  items: CartItem[],
  discount: number,
  discountType: "fixed" | "percentage",
  tax: number
) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount =
    discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * tax) / 100;
  const total = afterDiscount + taxAmount;

  return { subtotal, discountAmount, taxAmount, total };
};

export const usePOSStore = create<POSState>((set) => ({
  items: [],
  discount: 0,
  discountType: "fixed",
  tax: 0, // Can be set based on business settings
  paymentType: "cash",
  customerNotes: "",

  // Computed values (initially 0)
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  total: 0,

  addItem: (menu) => {
    set((state) => {
      // Check if item already exists
      const existingIndex = state.items.findIndex(
        (item) => item.menu_id === menu.id
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Update quantity of existing item
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...state.items,
          {
            id: generateId(),
            menu_id: menu.id,
            menu_name: menu.name,
            quantity: 1,
            unit_price: menu.price,
            subtotal: menu.price,
          },
        ];
      }

      const totals = calculateTotals(
        newItems,
        state.discount,
        state.discountType,
        state.tax
      );

      return { items: newItems, ...totals };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      const totals = calculateTotals(
        newItems,
        state.discount,
        state.discountType,
        state.tax
      );
      return { items: newItems, ...totals };
    });
  },

  updateQuantity: (id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.id !== id);
        const totals = calculateTotals(
          newItems,
          state.discount,
          state.discountType,
          state.tax
        );
        return { items: newItems, ...totals };
      }

      const newItems = state.items.map((item) =>
        item.id === id
          ? { ...item, quantity, subtotal: quantity * item.unit_price }
          : item
      );

      const totals = calculateTotals(
        newItems,
        state.discount,
        state.discountType,
        state.tax
      );

      return { items: newItems, ...totals };
    });
  },

  updateItemNotes: (id, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, notes } : item
      ),
    }));
  },

  setDiscount: (amount, type) => {
    set((state) => {
      const totals = calculateTotals(state.items, amount, type, state.tax);
      return { discount: amount, discountType: type, ...totals };
    });
  },

  setPaymentType: (paymentType) => set({ paymentType }),

  setCustomerNotes: (customerNotes) => set({ customerNotes }),

  clearCart: () =>
    set({
      items: [],
      discount: 0,
      discountType: "fixed",
      paymentType: "cash",
      customerNotes: "",
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0,
    }),
}));

