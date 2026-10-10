import type { Chore } from '../../api/chores';
import { ChoreRow, type ChoreRowProps } from './ChoreRow';
interface Props extends Omit<ChoreRowProps, 'chore'> { chores: Chore[]; }
export function ChoreList({ chores, ...props }: Props) {
    return <div className="table-responsive"><table className="table table-striped react-chores-table">
        <thead><tr><th>{props.t('Actions')}</th><th>{props.t('Chore')}</th><th>{props.t('Next estimated tracking')}</th><th>{props.t('Last tracked')}</th>{props.assignments && <th>{props.t('Assigned to')}</th>}</tr></thead>
        <tbody>{chores.map(chore => <ChoreRow key={chore.chore_id} chore={chore} {...props} />)}</tbody>
    </table></div>;
}
