import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, FormControl, FormControlLabel, InputAdornment, InputLabel, OutlinedInput, Checkbox, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import BidingPanel from "./../components/BidingPanel";
import Repository from "./../services/repository";
import Timer from "./../components/Timer";
import "./item.scss";

export default function ItemPage() {
	let { id } = useParams();
	let [item, setItem] = useState(null);
	let [bidValue, setBidValue] = useState(0);
	let [autoBid, setAutoBid] = useState(false);
	let [message, setMessage] = useState("");

	useEffect(() => {
		Repository.getItemDetails(id).then((item) => {
			setItem(item);
			setBidValue(item.min_bid);
		});
	}, [id]);

	const handleBidChange = (event) => {
		const reg = /^\d*$/;
		const value = event.target.value;

		if (!reg.test(value)) {
			event.preventDefault();
			return;
		}

		setBidValue(value);
	};

	const handleAutoBidChange = (event) => {
		const isChecked = event.target.checked;
		setAutoBid(isChecked);
	};

	const preventDefaultFormSubmit = (event) => event.preventDefault();

	const validateBid = (bid) => {
		const value = Number(bid);
		const isSafeInteger = value < Number.MAX_SAFE_INTEGER && value >= item.min_bid;
		return isSafeInteger;
	};

	const submitBiding = () => {
		setItem({ ...item, can_bid: false });

		const isValidBid = validateBid(bidValue);

		if (!isValidBid) return false;

		Repository.bid(item.id, bidValue, autoBid).then((response) => {
			const message = response.message || "You bid has been submitted";

			if (response.status) {
				const item = response.item;
				setItem(item);
				setBidValue(item.min_bid);
			}
			setMessage(message);
		});
	};

	return (
		item && (
			<div className="wrapper">
				<Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} autoHideDuration={6000} key={new Date().getMilliseconds()}>
					<MuiAlert elevation={6} variant="filled" severity="success">
						{message}
					</MuiAlert>
				</Snackbar>
				<div className="item-card">
					<div className="img">
						<div style={{ backgroundImage: `url(${item.image_url})` }} alt={`${item.name} Picture`}></div>
					</div>
					<div className="item-details">
						<div className="details">
							<h4 className="name">{item.name}</h4>
							<p className="description">{item.description}</p>
							<p className="starting-price">Bid started at {item.starting_price}$</p>
						</div>
						<Timer date={item.close_at} />
						<div className="bid-form">
							<form onSubmit={preventDefaultFormSubmit}>
								<FormControl fullWidth variant="outlined" error={!validateBid(bidValue)}>
									<InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
									<OutlinedInput value={bidValue} onChange={handleBidChange} startAdornment={<InputAdornment position="start">$</InputAdornment>} labelWidth={60} />
								</FormControl>

								<FormControl className="submit-actions">
									<FormControlLabel control={<Checkbox checked={autoBid} color="primary" onChange={handleAutoBidChange} name="auto_bid" />} label="Enable Auto-biding?" />

									<Button variant="contained" style={{ marginTop: "2rem" }} color="primary" size="small" disabled={!item.can_bid || !validateBid(bidValue)} onClick={submitBiding}>
										Submit Bid
									</Button>
								</FormControl>
							</form>
						</div>
					</div>
				</div>
				<BidingPanel bids={item.history} />
			</div>
		)
	);
}
