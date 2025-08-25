import React from "react";
import ReactDOM from "react-dom/client";
import MainScreen from "./screens/MainScreen";
import { SelectedElementProvider } from "./hooks/useSelectedElement";

import "./app.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const App = () => (
	<React.StrictMode>
		<SelectedElementProvider>
			<MainScreen />
		</SelectedElementProvider>
	</React.StrictMode>
);

root.render(<App />);
