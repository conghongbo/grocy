import '../styles/chores.css';
import { ChoresPage } from '../features/chores';
import type { ChoresContext } from '../features/chores/ChoresPage';
import { mountReactPage } from '../app/mount';
const context = document.getElementById('react-chores-context');
if (!context?.textContent) throw new Error('Chores bootstrap context is missing');
mountReactPage('react-chores-root', <ChoresPage context={JSON.parse(context.textContent) as ChoresContext} />);
