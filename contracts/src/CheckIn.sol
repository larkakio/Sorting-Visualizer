// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base L2. No ETH accepted — user pays gas only.
contract CheckIn {
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streakCount);

    error NoValueAllowed();
    error AlreadyCheckedIn();

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert NoValueAllowed();

        uint256 day = currentDay();
        uint256 last = lastCheckInDay[msg.sender];
        if (last != 0 && last >= day) revert AlreadyCheckedIn();

        uint256 nextStreak;
        if (last == 0) {
            nextStreak = 1;
        } else if (last == day - 1) {
            nextStreak = streak[msg.sender] + 1;
        } else {
            nextStreak = 1;
        }

        streak[msg.sender] = nextStreak;
        lastCheckInDay[msg.sender] = day;

        emit CheckedIn(msg.sender, day, nextStreak);
    }
}
