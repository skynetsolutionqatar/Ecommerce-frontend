"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Search } from "lucide-react";

interface Item {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  subMenu?: Item[];
}

interface Section {
  title: string;
  items: Item[];
}

export default function CommandSearch({
  sections,
}: {
  sections: Section[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const flatItems = useMemo(() => {
    const result: {
      name: string;
      path: string;
      icon?: React.ReactNode;
      group: string;
    }[] = [];

    sections?.forEach((section) => {
      section.items?.forEach((item) => {
        if (item.subMenu?.length) {
          item.subMenu.forEach((sub) => {
            if (sub.path) {
              result.push({
                name: sub.name,
                path: sub.path,
                icon: sub.icon,
                group: section.title,
              });
            }
          });
        } else if (item.path) {
          result.push({
            name: item.name,
            path: item.path,
            icon: item.icon,
            group: section.title,
          });
        }
      });
    });

    return result;
  }, [sections]);

  const groupedItems = useMemo(() => {
    return flatItems.reduce(
      (acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
      },
      {} as Record<string, typeof flatItems>
    );
  }, [flatItems]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm transition hover:border-ring hover:bg-muted/60 hover:text-foreground"
      >
        <Search size={16} className="shrink-0" />
        <span className="truncate">
          <span className="hidden lg:inline">Search menu... (Ctrl + K)</span>
          <span className="lg:hidden">Search...</span>
        </span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="admin-command-search-dialog"
      >
        <Command className="admin-command-search-panel">
          <CommandInput placeholder="Search modules..." />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {Object.entries(groupedItems).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item, idx) => (
                  <CommandItem
                    key={idx}
                    value={item.name}
                    onSelect={() => {
                      router.push(item.path);
                      setOpen(false);
                    }}
                    className="admin-command-search-item"
                  >
                    {item.icon}
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
