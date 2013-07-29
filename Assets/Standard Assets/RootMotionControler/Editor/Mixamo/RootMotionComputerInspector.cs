using UnityEditor;
using UnityEngine;
using System.Collections;

[CustomEditor(typeof(RootMotionComputer))]
public class RootMotionComputerInspector : Editor
{
	private RootMotionComputer computer;
	
	private static Color rightAxisColor = new Color(219f/255f,62f/255f,29f/255f,1f);
		
	void OnSceneGUI()
	{
		computer = (RootMotionComputer) target;
		
		if (!computer.isDebugMode || computer.pelvis == null) return;
		
		Color col = Handles.color;
		
		// draw a label at the pelvis
		Handles.Label(computer.pelvis.position, "Pelvis");
		
		// draw the pelvis right axis
		Handles.color = rightAxisColor;
		Handles.ArrowCap(-1, computer.pelvis.position, computer.pelvis.rotation*Quaternion.FromToRotation(Vector3.forward, computer.pelvisRightAxis), computer.debugGizmoSize);
		Handles.Label(computer.pelvis.position+computer.pelvis.TransformDirection(computer.pelvisRightAxis).normalized*computer.debugGizmoSize, "Right Axis");
		
		Handles.color = col;
	}
}
