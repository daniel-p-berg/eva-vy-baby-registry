import type { RegistryItem } from "@/lib/types";

type Props = {
  secret: string;
  action: (formData: FormData) => void | Promise<void>;
  item?: RegistryItem;
};

export function ItemForm({ secret, action, item }: Props) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="secret" value={secret} />
      {item ? <input type="hidden" name="itemId" value={item.id} /> : null}
      <label className="sm:col-span-2">
        <span className="label">Title</span>
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={item?.title}
          className="field"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="label">Description</span>
        <textarea
          name="description"
          rows={3}
          maxLength={3000}
          defaultValue={item?.description}
          className="field"
        />
      </label>
      <label>
        <span className="label">Image path</span>
        <input
          name="imagePath"
          required
          defaultValue={item?.image_path || "/products/placeholder.png"}
          pattern="/products/.+\.png"
          className="field"
        />
      </label>
      <label>
        <span className="label">Category</span>
        <input
          name="category"
          required
          defaultValue={item?.category || "Baby"}
          className="field"
        />
      </label>
      <label>
        <span className="label">Type</span>
        <select
          name="itemType"
          defaultValue={item?.item_type || "fixed"}
          className="field"
        >
          <option value="fixed">Fixed gift</option>
          <option value="fund">Group fund</option>
        </select>
      </label>
      <label>
        <span className="label">Sort order</span>
        <input
          name="sortOrder"
          type="number"
          step="1"
          defaultValue={item?.sort_order ?? 0}
          className="field"
        />
      </label>
      <div className="rounded-2xl bg-peach-50 p-4 sm:col-span-2">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-peach-700">
          Fixed-gift fields
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label>
            <span className="label">USD price</span>
            <input
              name="priceUsd"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={item?.price_usd ?? ""}
              className="field"
            />
          </label>
          <label>
            <span className="label">VND price</span>
            <input
              name="priceVnd"
              type="number"
              min="1"
              step="1"
              defaultValue={item?.price_vnd ?? ""}
              className="field"
            />
          </label>
          <label>
            <span className="label">Quantity needed</span>
            <input
              name="quantityNeeded"
              type="number"
              min="1"
              step="1"
              defaultValue={item?.quantity_needed ?? ""}
              className="field"
            />
          </label>
        </div>
      </div>
      <div className="rounded-2xl bg-sage-50 p-4 sm:col-span-2">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-sage-700">
          Group-fund fields
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="label">USD target</span>
            <input
              name="fundTargetUsd"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={item?.fund_target_usd ?? ""}
              className="field"
            />
          </label>
          <label>
            <span className="label">VND target</span>
            <input
              name="fundTargetVnd"
              type="number"
              min="1"
              step="1"
              defaultValue={item?.fund_target_vnd ?? ""}
              className="field"
            />
          </label>
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-peach-200 bg-white p-4 sm:col-span-2">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={item?.is_active ?? true}
          className="size-4 accent-[#53664b]"
        />
        <span>
          <strong className="block text-sm">Active</strong>
          <span className="text-xs text-stone-500">
            Inactive items are hidden from the public registry.
          </span>
        </span>
      </label>
      <button type="submit" className="button-primary sm:col-span-2">
        {item ? "Save item" : "Create item"}
      </button>
    </form>
  );
}
