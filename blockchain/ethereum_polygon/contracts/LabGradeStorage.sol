// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LabGradeStorage {
    struct Grade {
        uint8 value;
        bool exists;
    }

    mapping(string => Grade) private labGrades;

    event LabGradeUpdated(string studentId, uint8 grade);

    function setLabGrade(string calldata studentId, uint8 grade) external {
        require(bytes(studentId).length > 0, "Empty studentId!");
        require(grade <= 10, "Invalid grade!");

        labGrades[studentId] = Grade({ value: grade, exists: true });
        emit LabGradeUpdated(studentId, grade);
    }

    function getLabGrade(string calldata studentId) external view returns (uint8) {
        require(labGrades[studentId].exists, "Student not found");
        return labGrades[studentId].value;
    }

    function hasLabGrade(string calldata studentId) external view returns (bool) {
        return labGrades[studentId].exists;
    }
}