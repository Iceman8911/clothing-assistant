export default function Dock(props: any) {
	return (
		<div class="dock">
			<button class="dock-active">
				<span class="dock-label">Home</span>
			</button>
			<button>
				<span class="dock-label">Stock</span>
			</button>
			<button>
				<span class="dock-label">Reports</span>
			</button>
			<button>
				<span class="dock-label">Settings</span>
			</button>
		</div>
	);
}
