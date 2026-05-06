// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    event CheckedIn(address indexed user, uint256 day, uint256 streakCount);

    CheckIn public c;

    address public alice = address(0xA11CE);
    uint256 internal constant ONE_DAY = 86400;

    function setUp() public {
        c = new CheckIn();
    }

    function test_checkIn_twice_same_day_reverts() public {
        vm.roll(100_000);
        vm.warp(100_000);
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedIn.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_checkIn_value_reverts() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(CheckIn.NoValueAllowed.selector);
        c.checkIn{value: 1 wei}();
        vm.stopPrank();
    }

    function test_checkIn_next_day_increments_streak() public {
        vm.roll(200_000);
        vm.warp(200_000);
        vm.startPrank(alice);
        uint256 d0 = c.currentDay();
        c.checkIn();
        assertEq(c.streak(alice), 1);
        assertEq(c.lastCheckInDay(alice), d0);

        vm.warp(block.timestamp + ONE_DAY);
        uint256 d1 = c.currentDay();
        assertGt(d1, d0);

        c.checkIn();
        assertEq(c.streak(alice), 2);
        vm.stopPrank();
    }

    function test_checkIn_after_gap_resets_streak() public {
        vm.roll(300_000);
        vm.warp(300_000);
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 3 * ONE_DAY);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        vm.stopPrank();
    }

    function test_event_emitted() public {
        vm.roll(400_000);
        vm.warp(400_000);
        vm.startPrank(alice);
        uint256 day = c.currentDay();
        vm.expectEmit(true, true, true, true);
        emit CheckedIn(alice, day, 1);
        c.checkIn();
        vm.stopPrank();
    }
}
