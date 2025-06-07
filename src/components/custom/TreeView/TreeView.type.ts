
type MenuItemType = {
    id: string;
    label: string;
    menu?: MenuItemType[];
    icon?: JSX.Element;
    onClick?: () => void;
};

export type { MenuItemType }