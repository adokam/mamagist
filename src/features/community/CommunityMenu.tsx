// The community menu, opened from the avatar in the community top bar.
// A simple dropdown panel. Tapping outside or the avatar again closes it.
export type MenuItem = {
  label: string;
  onClick: () => void;
};

export function CommunityMenu({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
}) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-transparent"
      />
      <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-[20px] border border-line bg-card shadow">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              onClose();
              item.onClick();
            }}
            className="block w-full px-4 py-3 text-left text-base font-bold text-ink"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
