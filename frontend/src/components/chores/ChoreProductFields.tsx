import type { ChoreDraft } from "../../domain/chores/choreForm";
interface Product { id: number; name: string; }
interface Props { value: ChoreDraft; onChange: (value: ChoreDraft) => void; products: Product[]; enabled: boolean; }
export function ChoreProductFields({ value, onChange, products, enabled }: Props) {
    if (!enabled) return null;
    return <fieldset className="react-chore-subsection"><legend>Product consumption</legend>
        <label><input type="checkbox" checked={value.consume_product_on_execution} onChange={event => onChange({ ...value, consume_product_on_execution: event.target.checked })} /> Consume product when chore is completed</label>
        {value.consume_product_on_execution && <>
            <label>Product<select value={value.product_id ?? ""} onChange={event => onChange({ ...value, product_id: event.target.value ? Number(event.target.value) : null })}>
                <option value="">Select product</option>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select></label>
            <p className="small text-muted">Amount uses the product’s stock quantity unit (same stored amount as the legacy form). For unit conversion or barcode workflows, use Legacy.</p>
            <label>Amount<input type="number" min="0.001" step="any" value={value.product_amount ?? ""} onChange={event => onChange({ ...value, product_amount: event.target.value === "" ? null : Number(event.target.value) })} /></label>
        </>}
    </fieldset>;
}
