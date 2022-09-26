import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { Image } from '../../types/Image';

type SelectedElementContext = [
  { element?: HTMLButtonElement; image?: Image },
  (element: HTMLButtonElement, image: Image) => void,
];

const context = createContext<SelectedElementContext>([{}, () => true]);

export const SelectedElementProvider = ({ children }: PropsWithChildren) => {
  const [element, setElementState] = useState<{
    element?: HTMLButtonElement;
    image?: Image;
  }>({});

  const setElement = (element: HTMLButtonElement, image: Image) =>
    setElementState({
      element,
      image,
    });

  return (
    <context.Provider value={[element, setElement]}>
      {children}
    </context.Provider>
  );
};

export default function useSelectedElement() {
  return useContext(context);
}
