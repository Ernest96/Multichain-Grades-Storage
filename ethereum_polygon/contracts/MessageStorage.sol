// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract GradeStorage {

    string public message;
    
    function setMessage(string calldata _message) external {
        message = _message;
    }
}