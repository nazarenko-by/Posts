// Одне й те саме дерево магазину (13 компонентів) для кожного варіанта стану.
// Різниться лише набір хуків: звідки компонент бере user / count / theme.
import { useTrack } from "./tracker.js";

export function makeTree(variant, h) {
  const Node = ({ name, label, children, accent }) => {
    const ref = useTrack(variant, name);
    return (
      <div className="node" ref={ref}>
        <div className="row"><span className="name">{name}</span>{label && <span className={accent ? "val acc" : "val"}>{label}</span>}</div>
        {children && <div className="kids">{children}</div>}
      </div>
    );
  };

  const Logo = () => <Node name="Logo" label="NBY" />;
  const UserName = () => <Node name="UserName" label={h.useUser()} />;
  const CartBadge = () => <Node name="CartBadge" label={`🛒 ${h.useCount()}`} accent />;
  const Header = () => <Node name="Header"><Logo /><UserName /><CartBadge /></Node>;

  const ThemeToggle = () => {
    const theme = h.useTheme();
    const toggle = h.useToggleTheme();
    return (
      <Node name="ThemeToggle" label={<button data-action="theme" onClick={toggle}>{theme}</button>} />
    );
  };
  const Toolbar = () => <Node name="Toolbar"><ThemeToggle /></Node>;

  const Card = ({ id }) => {
    const add = h.useAddToCart();
    return <Node name={`Card ${id}`} label={<button data-action="add" onClick={add}>в кошик</button>} />;
  };
  const ProductList = () => (
    <Node name="ProductList">{[1, 2, 3, 4].map((id) => <Card key={id} id={id} />)}</Node>
  );
  const Footer = () => <Node name="Footer" label="© 2026" />;

  return function Shop() {
    return <Node name="Shop"><Header /><Toolbar /><ProductList /><Footer /></Node>;
  };
}
